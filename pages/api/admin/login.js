import { authConfigured, checkCredentials, createSessionCookie } from '@/lib/server/auth';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';
import { body } from '@/lib/server/validate';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  if (!authConfigured()) {
    return res.status(503).json({ message: 'Admin login is not configured on this server.' });
  }
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 5, 15 * 60_000)) {
    return res.status(429).json({ message: 'Too many login attempts. Try again in 15 minutes.' });
  }
  const { email, password } = body(req);
  const user = checkCredentials(email, password);
  if (!user) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.setHeader('Set-Cookie', createSessionCookie(user));
  return res.status(200).json({ ok: true, role: user.role });
}
