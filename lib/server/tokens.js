import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

export function shortCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function enquiryRef() {
  return `PWC26-${shortCode(6)}`;
}

// Unsubscribe links are HMAC-signed so they can't be forged for other emails.
function key() {
  return process.env.SESSION_SECRET || 'dev-only-unsubscribe-key';
}

export function unsubscribeToken(email) {
  return crypto.createHmac('sha256', key()).update(`unsub:${email.toLowerCase()}`).digest('base64url').slice(0, 32);
}

export function verifyUnsubscribeToken(email, token) {
  if (!email || !token) return false;
  const expected = unsubscribeToken(email);
  return token.length === expected.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
