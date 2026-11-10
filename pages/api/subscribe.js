import { store } from '@/lib/server/store';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';
import { clean, isEmail, body, LIMITS } from '@/lib/server/validate';
import { unsubscribeToken } from '@/lib/server/tokens';
import { sendMail, subscribeEmail } from '@/lib/server/mailer';
import { SITE } from '@/lib/config/site';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const input = body(req);
  if (clean(input.website)) return res.status(200).json({ ok: true });
  if (!rateLimit(`subscribe:${clientIp(req)}`, 5, 10 * 60_000)) {
    return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
  }

  const email = clean(input.email, LIMITS.medium).toLowerCase();
  const name = clean(input.name);
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!(input.consent === true || input.consent === 'true')) {
    return res.status(400).json({ message: 'Please tick the box to agree to receive updates.' });
  }

  try {
    const now = new Date().toISOString();
    const existing = await store.get('subscribers', email);
    if (existing) {
      if (existing.status !== 'subscribed') await store.update('subscribers', email, { status: 'subscribed', updatedAt: now });
    } else {
      await store.insert('subscribers', {
        email, name, status: 'subscribed', consent: 'yes', source: clean(input.page, LIMITS.medium), createdAt: now, updatedAt: now,
      });
    }
    const unsubscribeUrl = `${SITE.url}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`;
    if (!existing || existing.status !== 'subscribed') await sendMail({ to: email, ...subscribeEmail({ name, unsubscribeUrl }) });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('subscribe error:', error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
