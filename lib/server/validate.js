// Shared input validation. Used by the API routes; the browser forms mirror
// these rules for instant feedback.

export const LIMITS = {
  short: 80,
  medium: 160,
  long: 1000,
};

export function clean(value, max = LIMITS.short) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
export function isEmail(v) {
  return typeof v === 'string' && v.length <= 160 && EMAIL_RE.test(v);
}

// Indian mobile: 10 digits starting 6–9, optional +91 / 91 / 0 prefix.
export function normalisePhone(v) {
  const digits = String(v || '').replace(/[^\d]/g, '');
  const ten = digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

// Accepts "@handle", "handle" or an instagram.com URL. Returns the bare handle.
export function normaliseInstagram(v) {
  let s = String(v || '').trim();
  if (!s) return '';
  const m = s.match(/instagram\.com\/([^/?#]+)/i);
  if (m) s = m[1];
  s = s.replace(/^@/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(s) ? s.toLowerCase() : null;
}

export function oneOf(v, list) {
  return list.includes(v) ? v : null;
}

export function isISODate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

export function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Read a JSON body safely (Next parses it already when Content-Type is JSON).
export function body(req) {
  return req.body && typeof req.body === 'object' ? req.body : {};
}
