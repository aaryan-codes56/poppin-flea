import { store } from '@/lib/server/store';
import { verifyUnsubscribeToken } from '@/lib/server/tokens';
import { body } from '@/lib/server/validate';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  if (!rateLimit(`unsub:${clientIp(req)}`, 20, 10 * 60_000)) return res.status(429).json({ message: 'Too many requests' });
  const { email, token } = body(req);
  const e = String(email || '').toLowerCase();
  if (!verifyUnsubscribeToken(e, String(token || ''))) return res.status(400).json({ message: 'This unsubscribe link is invalid.' });
  try {
    await store.update('subscribers', e, { status: 'unsubscribed', updatedAt: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('unsubscribe error:', error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
