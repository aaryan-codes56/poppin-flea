// Customer table booking (original flow, preserved).
// Changes from the original: dates/slots come from config, on-spot bookings
// need an admin session, uploads are limited to images ≤ 5 MB, values are
// validated and emails are HTML-escaped.

import formidable from 'formidable';
import { TABLE_BOOKING, areaLimit } from '@/lib/config/tableBooking';
import { getAllRows, appendRow, COL } from '@/lib/server/bookings';
import { getSession } from '@/lib/server/auth';
import { dataDriver } from '@/lib/server/google';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';
import { clean, isEmail, normalisePhone, LIMITS } from '@/lib/server/validate';
import { sendMail, bookingReceivedEmail } from '@/lib/server/mailer';

export const config = { api: { bodyParser: false } };

async function uploadScreenshot(file, transactionId, name) {
  // Local development never uploads to the real Cloudinary account.
  if (dataDriver() === 'local') return { link: '', error: 'Upload skipped in local mode' };
  if (!process.env.CLOUDINARY_CLOUD_NAME) return { link: '', error: 'Cloudinary not configured' };
  try {
    const cloudinary = (await import('cloudinary')).v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const safe = (s) => String(s || '').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40);
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'poppin_bookings',
      public_id: `payment_${safe(transactionId)}_${safe(name)}_${Date.now()}`,
      resource_type: 'image',
    });
    return { link: result.secure_url, error: null };
  } catch (e) {
    console.error('Cloudinary upload failed:', e.message);
    return { link: '', error: e.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  if (!rateLimit(`booking:${clientIp(req)}`, 10, 10 * 60_000)) {
    return res.status(429).json({ message: 'Too many attempts. Please try again in a few minutes.' });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024,
      maxFields: 30,
      filter: ({ mimetype }) => Boolean(mimetype && mimetype.startsWith('image/')),
    });
    const [fields, files] = await form.parse(req);
    const get = (k) => (Array.isArray(fields[k]) ? fields[k][0] : fields[k]);

    const isOnSpot = get('isOnSpot') === 'true';
    const session = getSession(req);
    if (isOnSpot && !session) return res.status(401).json({ message: 'On-spot registration requires admin login' });
    if (!TABLE_BOOKING.enabled && !isOnSpot) {
      return res.status(403).json({ message: 'Table bookings are currently closed.' });
    }

    const name = clean(get('name'));
    const phone = normalisePhone(get('phone'));
    const email = clean(get('email'), LIMITS.medium).toLowerCase();
    const area = clean(get('area'));
    const date = clean(get('date'), 10);
    const timeSlot = clean(get('timeSlot'), 5);
    const adults = parseInt(get('adults'), 10);
    const children = parseInt(get('children') || '0', 10);
    const comments = clean(get('comments'), 500);
    const transactionId = clean(get('transactionId'), 60);
    const upiName = clean(get('upiName'));

    if (!name || !get('phone') || !email || !area || !date || !timeSlot || !get('adults')) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!phone) return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    if (!TABLE_BOOKING.dates.some((d) => d.value === date)) {
      return res.status(400).json({ message: 'Invalid date selected.' });
    }
    if (!TABLE_BOOKING.timeSlots.includes(timeSlot)) return res.status(400).json({ message: 'Invalid time slot selected.' });
    const limit = areaLimit(area);
    if (!limit) return res.status(400).json({ message: 'Invalid area selected.' });
    if (!Number.isInteger(adults) || adults < 1 || adults > limit || !Number.isInteger(children) || children < 0 || children > 20) {
      return res.status(400).json({ message: 'Invalid guest count' });
    }

    const screenshot = files.screenshot ? (Array.isArray(files.screenshot) ? files.screenshot[0] : files.screenshot) : null;
    if (!screenshot && !isOnSpot) return res.status(400).json({ message: 'Payment screenshot is required for verification' });
    if (!isOnSpot && !transactionId) return res.status(400).json({ message: 'Transaction ID is required' });

    // Capacity check (adults only; cancelled rows ignored) — unchanged logic.
    const rows = await getAllRows();
    const taken = rows
      .filter((r) => r[COL.DATE] === date && r[COL.TIME] === timeSlot && r[COL.AREA] === area && r[COL.STATUS] !== 'Cancelled')
      .reduce((t, r) => t + (parseInt(r[COL.ADULTS] || 0, 10) || 0), 0);
    if (taken + adults > limit) {
      const remaining = Math.max(0, limit - taken);
      return res.status(400).json({
        message: `Sorry, only ${remaining} spot${remaining !== 1 ? 's' : ''} left for adults in ${area} for this time slot.`,
      });
    }

    const upload = screenshot ? await uploadScreenshot(screenshot, transactionId, name) : { link: '', error: null };

    const refId = String(rows.length).padStart(3, '0');
    await appendRow([
      refId, name, phone, email, area, date, timeSlot, adults, children,
      comments, transactionId, upiName, upload.link, 'Pending Verification',
    ]);

    await sendMail({
      to: email,
      ...bookingReceivedEmail({
        refId, name, date, timeSlot, area, adults, children, transactionId,
        total: (adults + children) * TABLE_BOOKING.pricePerGuest,
        queriesPhone: TABLE_BOOKING.queriesPhone,
      }),
      fromName: 'PoppinFlea',
    });

    return res.status(200).json({ message: 'Booking created successfully', refId, uploadError: upload.error });
  } catch (error) {
    if (error?.code === 1009 || /maxFileSize/i.test(error?.message || '')) {
      return res.status(413).json({ message: 'Screenshot is too large (max 5 MB).' });
    }
    console.error('createBooking error:', error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
