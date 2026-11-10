// Server-side admin authentication.
// - Passwords are stored as scrypt hashes in env vars (never in code).
// - Sessions are HMAC-signed, HttpOnly, SameSite=Strict cookies.
// - Every admin API is wrapped with `withAdmin`, so hiding the UI is never
//   the only protection.

import crypto from 'crypto';
import { rateLimit, clientIp } from './rateLimit';

export const SESSION_COOKIE = 'poppin_admin';
const SESSION_HOURS = 8;

export const ROLES = { admin: 'admin', staff: 'staff' };

function secret() {
  const s = process.env.SESSION_SECRET || '';
  return s.length >= 32 ? s : null;
}

export function authConfigured() {
  return Boolean(secret() && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);
}

// Format: scrypt:<salt hex>:<hash hex>
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string') return false;
  const [algo, saltHex, hashHex] = stored.split(':');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

function users() {
  const list = [];
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
    list.push({ email: process.env.ADMIN_EMAIL.toLowerCase(), hash: process.env.ADMIN_PASSWORD_HASH, role: ROLES.admin });
  }
  if (process.env.STAFF_EMAIL && process.env.STAFF_PASSWORD_HASH) {
    list.push({ email: process.env.STAFF_EMAIL.toLowerCase(), hash: process.env.STAFF_PASSWORD_HASH, role: ROLES.staff });
  }
  return list;
}

// Constant-ish time: always run one scrypt even for unknown emails.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

export function checkCredentials(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const user = users().find((u) => u.email === e);
  const ok = verifyPassword(String(password || ''), user ? user.hash : DUMMY_HASH);
  return ok && user ? { email: user.email, role: user.role } : null;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionCookie(user) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = Buffer.from(JSON.stringify({ e: user.email, r: user.role, exp })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  return serializeCookie(token, SESSION_HOURS * 3600);
}

export function clearSessionCookie() {
  return serializeCookie('', 0);
}

function serializeCookie(value, maxAge) {
  const parts = [`${SESSION_COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function readCookie(req, name) {
  const header = req.headers?.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

export function getSession(req) {
  if (!secret()) return null;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return { email: data.e, role: data.r };
  } catch {
    return null;
  }
}

// Reject cross-site state-changing requests (defence in depth on top of SameSite).
function sameOrigin(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients; cookie is still required
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function withAdmin(handler, { roles = [ROLES.admin, ROLES.staff] } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!rateLimit(`admin-api:${clientIp(req)}`, 240, 60_000)) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    const session = getSession(req);
    if (!session) return res.status(401).json({ message: 'Unauthorised' });
    if (!roles.includes(session.role)) return res.status(403).json({ message: 'Forbidden' });
    if (!sameOrigin(req)) return res.status(403).json({ message: 'Cross-site request blocked' });
    req.admin = session;
    return handler(req, res);
  };
}
