// Public stall enquiry for Poppin Winter Carnival 2026.
import { store } from '@/lib/server/store';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';
import { clean, isEmail, normalisePhone, normaliseInstagram, oneOf, body, LIMITS } from '@/lib/server/validate';
import { enquiryRef } from '@/lib/server/tokens';
import { sendMail, vendorConfirmationEmail, vendorOrganiserEmail, organiserEmail } from '@/lib/server/mailer';
import { VENDOR_CATEGORIES, STALL_PREFERENCES, WINTER_CARNIVAL } from '@/lib/config/event';

export function validateEnquiry(input) {
  const errors = {};
  const v = {
    brandName: clean(input.brandName),
    contactName: clean(input.contactName),
    phone: normalisePhone(input.phone),
    email: clean(input.email, LIMITS.medium).toLowerCase(),
    instagram: normaliseInstagram(input.instagram),
    category: oneOf(input.category, VENDOR_CATEGORIES),
    description: clean(input.description, LIMITS.long),
    stallPreference: oneOf(input.stallPreference, STALL_PREFERENCES),
    requirements: clean(input.requirements, LIMITS.long),
    consent: input.consent === true || input.consent === 'true',
  };
  if (v.brandName.length < 2) errors.brandName = 'Please enter your brand or business name.';
  if (v.contactName.length < 2) errors.contactName = 'Please enter the contact person’s name.';
  if (!v.phone) errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
  if (!isEmail(v.email)) errors.email = 'Please enter a valid email address.';
  if (v.instagram === null) errors.instagram = 'That doesn’t look like an Instagram handle.';
  if (!v.category) errors.category = 'Please choose a category.';
  if (v.description.length < 10) errors.description = 'Tell us a little about what you sell (at least 10 characters).';
  if (!v.stallPreference) errors.stallPreference = 'Please choose a stall preference.';
  if (!v.consent) errors.consent = 'Please agree to be contacted about your enquiry.';
  return { values: v, errors };
}

function sourceFrom(input) {
  const s = input.source && typeof input.source === 'object' ? input.source : {};
  const parts = [
    s.utm_source && `utm_source=${s.utm_source}`,
    s.utm_medium && `utm_medium=${s.utm_medium}`,
    s.utm_campaign && `utm_campaign=${s.utm_campaign}`,
    s.referrer && `ref=${s.referrer}`,
    s.page && `page=${s.page}`,
  ].filter(Boolean);
  return clean(parts.join(' · '), 300);
}

// Requests currently being saved, keyed by phone + brand, so two near-simultaneous
// submissions can't both pass the duplicate check.
const inFlight = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  if (!WINTER_CARNIVAL.stalls.preBookingOpen) return res.status(403).json({ message: 'Stall enquiries are closed.' });

  const input = body(req);
  // Honeypot: real visitors never see or fill this field.
  if (clean(input.website)) return res.status(200).json({ ok: true, ref: 'PWC26-RECEIVED' });

  if (!rateLimit(`enquiry:${clientIp(req)}`, 5, 10 * 60_000)) {
    return res.status(429).json({ message: 'Too many enquiries from this connection. Please try again later or WhatsApp us.' });
  }

  const { values, errors } = validateEnquiry(input);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please check the highlighted fields.', errors });

  const dupKey = `${values.phone}|${values.brandName.toLowerCase()}`;
  if (inFlight.has(dupKey)) return res.status(409).json({ message: 'This enquiry is already being submitted.' });
  inFlight.add(dupKey);
  try {
    // Duplicate guard: same phone + brand in the last 10 minutes returns the existing reference.
    const recent = (await store.list('vendorEnquiries')).find(
      (e) =>
        e.phone === values.phone &&
        e.brandName.toLowerCase() === values.brandName.toLowerCase() &&
        Date.now() - Date.parse(e.createdAt) < 10 * 60_000
    );
    if (recent) return res.status(200).json({ ok: true, ref: recent.ref, duplicate: true });

    const now = new Date().toISOString();
    const enquiry = {
      ref: enquiryRef(),
      createdAt: now,
      ...values,
      consent: 'yes',
      status: 'New',
      notes: '',
      followUpDate: '',
      updatedAt: now,
      updatedBy: '',
      source: sourceFrom(input),
    };
    await store.insert('vendorEnquiries', enquiry);

    const confirmation = await sendMail({ to: enquiry.email, ...vendorConfirmationEmail(enquiry) });
    const organiser = organiserEmail();
    if (organiser) await sendMail({ to: organiser, ...vendorOrganiserEmail(enquiry), fromName: 'Poppin website' });

    return res.status(201).json({ ok: true, ref: enquiry.ref, emailSent: confirmation.sent });
  } catch (error) {
    console.error('enquiry error:', error.message);
    return res.status(500).json({ message: 'We couldn’t save your enquiry. Please try again or WhatsApp us.' });
  } finally {
    inFlight.delete(dupKey);
  }
}
