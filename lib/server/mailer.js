// Email sending. In development emails are rendered and logged, never sent,
// unless EMAIL_DRIVER=smtp is set explicitly.

import nodemailer from 'nodemailer';
import { escapeHtml as h } from './validate';
import { CONTACT, SITE } from '../config/site';
import { WINTER_CARNIVAL as E, VENUE_TBA_LABEL } from '../config/event';

export function emailDriver() {
  const explicit = process.env.EMAIL_DRIVER;
  if (explicit === 'smtp' || explicit === 'log') return explicit;
  return process.env.NODE_ENV === 'production' ? 'smtp' : 'log';
}

export function emailConfigured() {
  return emailDriver() === 'log' || Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

let transporter = null;
function getTransport() {
  if (transporter) return transporter;
  transporter =
    emailDriver() === 'smtp'
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        })
      : nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

export const outbox = []; // last few logged emails (dev only), handy for tests

// Never throws: email failure must not break a booking or enquiry.
export async function sendMail({ to, subject, html, replyTo, fromName = 'Poppin' }) {
  if (!to) return { sent: false, reason: 'no-recipient' };
  if (emailDriver() === 'smtp' && !(process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
    return { sent: false, reason: 'not-configured' };
  }
  try {
    const from = `"${fromName}" <${process.env.EMAIL_USER || 'no-reply@poppinflea.in'}>`;
    await getTransport().sendMail({ from, to, subject, html, replyTo });
    if (emailDriver() === 'log') {
      outbox.unshift({ to, subject, at: new Date().toISOString() });
      outbox.length = Math.min(outbox.length, 20);
      console.info(`[email:log] to=${to} subject="${subject}"`);
    }
    return { sent: true };
  } catch (err) {
    console.error('Email sending failed:', err.message);
    return { sent: false, reason: 'error' };
  }
}

export function organiserEmail() {
  return process.env.ORGANISER_EMAIL || process.env.EMAIL_USER || null;
}

// ---------- Layout ----------
function layout(inner) {
  return `<!doctype html><html><body style="margin:0;background:#f6efe3;font-family:Arial,Helvetica,sans-serif;color:#2a1a1d">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#4a0d1a;border-radius:16px 16px 0 0;padding:20px 28px;color:#f6efe3">
      <div style="font-size:22px;font-weight:bold;letter-spacing:.5px;color:#f4d92f">POPPIN’</div>
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.8">${h(E.fullName)}</div>
    </div>
    <div style="background:#fffaf2;border-radius:0 0 16px 16px;padding:28px;border:1px solid #ead9c0;border-top:0">${inner}</div>
    <p style="text-align:center;font-size:12px;color:#7a6560;margin-top:16px">
      Call / WhatsApp ${h(CONTACT.phone)} · Instagram ${h(CONTACT.instagramHandle)} · <a href="${SITE.url}" style="color:#7a1f2e">${h(SITE.url.replace(/^https?:\/\//, ''))}</a>
    </p>
  </div></body></html>`;
}

function refBox(label, ref) {
  return `<div style="background:#f6efe3;border:1px dashed #c9a24a;border-radius:12px;padding:14px 18px;margin:20px 0">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7a6560">${h(label)}</div>
    <div style="font-size:22px;font-weight:bold;color:#4a0d1a;letter-spacing:1px">${h(ref)}</div></div>`;
}

function rows(pairs) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#7a6560;width:40%;vertical-align:top">${h(k)}</td><td style="padding:6px 0">${h(v)}</td></tr>`
    )
    .join('')}</table>`;
}

// ---------- Vendor enquiry emails ----------
export function vendorConfirmationEmail(enq) {
  return {
    subject: `We’ve got your stall enquiry — ${enq.ref} · ${E.fullName}`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;color:#4a0d1a">Thanks, ${h(enq.contactName)}! 🎄</h1>
      <p>We’ve received the stall enquiry for <strong>${h(enq.brandName)}</strong> at ${h(E.fullName)}.</p>
      ${refBox('Enquiry reference', enq.ref)}
      <p><strong>What happens next:</strong> the Poppin team will review your enquiry and contact you on <strong>${h(enq.phone)}</strong> with availability and stall details.</p>
      <p style="background:#fff3cd;border-radius:8px;padding:10px 14px;font-size:13px">This is an enquiry, not a confirmed booking. Your stall is confirmed only once the Poppin team confirms it with you.</p>
      ${rows([
        ['Event', `${E.dateLabelLong}`],
        ['Location', `${E.locationLabel} · ${VENUE_TBA_LABEL}`],
        ['Category', enq.category],
        ['Stall preference', enq.stallPreference],
      ])}
      <p style="margin-top:20px">Questions? Call or WhatsApp <strong>${h(CONTACT.phone)}</strong> and quote your reference.</p>
      <p>See you at the carnival,<br><strong>Team Poppin</strong></p>`),
  };
}

export function vendorOrganiserEmail(enq) {
  return {
    subject: `New stall enquiry ${enq.ref}: ${enq.brandName} (${enq.category})`,
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px;color:#4a0d1a">New stall enquiry</h1>
      ${refBox('Reference', enq.ref)}
      ${rows([
        ['Brand', enq.brandName],
        ['Contact', enq.contactName],
        ['Phone', enq.phone],
        ['Email', enq.email],
        ['Instagram', enq.instagram ? `@${enq.instagram}` : ''],
        ['Category', enq.category],
        ['Stall preference', enq.stallPreference],
        ['Products / services', enq.description],
        ['Requirements', enq.requirements],
        ['Source', enq.source],
      ])}
      <p style="margin-top:16px">Manage it in the admin dashboard → Vendor enquiries.</p>`),
    replyTo: enq.email,
  };
}

// ---------- Table booking emails (copy preserved from the original system) ----------
export function bookingReceivedEmail({ refId, name, date, timeSlot, area, adults, children, transactionId, total, queriesPhone }) {
  return {
    subject: `Booking Received - #${refId} - PoppinFlea`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;color:#4a0d1a">Booking request received ⏳</h1>
      <p>Hi ${h(name)},</p><p>We have received your booking request.</p>
      ${refBox('Reference ID · Pending verification', `#${refId}`)}
      <p>We will verify your payment (Transaction ID: ${h(transactionId || 'N/A')}) within <strong>12–15 hours</strong>. Once verified, you will receive a final confirmation email.</p>
      ${rows([
        ['Date', date],
        ['Time', timeSlot],
        ['Area', area],
        ['Guests', `${adults} Adults, ${children} Children`],
        ['Total amount', `Rs. ${total}`],
      ])}
      <p style="margin-top:16px;font-size:13px;color:#7a6560">For any queries: ${h(queriesPhone)}</p>`),
  };
}

export function bookingConfirmedEmail({ refId, date, timeSlot, area, adults, children, venue, queriesPhone }) {
  return {
    subject: `🎉 Table Confirmed! - #${refId} - Poppin`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;color:#4a0d1a">Hey there! 👋</h1>
      <p>Your table reservation at <strong>Poppin</strong> is confirmed — we can't wait to host you!</p>
      ${refBox('Reference ID', `#${refId}`)}
      ${rows([
        ['Date', date],
        ['Time', timeSlot],
        ['Area', area],
        ['Guests', `${adults} Adults, ${children} Children`],
        ['Venue', venue.name ? `${venue.name}, ${venue.address}` : VENUE_TBA_LABEL],
      ])}
      ${venue.mapUrl ? `<p><a href="${h(venue.mapUrl)}" style="display:inline-block;background:#f4d92f;color:#2a1a1d;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">📍 Get directions</a></p>` : ''}
      <h3 style="color:#4a0d1a">About your payment</h3>
      <p>The total amount you paid will be <strong>fully reimbursed in your final bill</strong>. Collect your voucher from the <strong>Reception at the entry gate</strong> when you arrive.</p>
      <h3 style="color:#4a0d1a">Table time</h3>
      <ul><li>Your table is reserved for <strong>45 minutes</strong></li><li>We give a <strong>15-minute buffer</strong> for small delays</li><li>Please arrive on time so you get the best experience!</li></ul>
      <p>Poppin gets packed, so this helps us keep the vibe smooth for everyone 💃🕺</p>
      <p><strong>See you at Poppin — let's make it fun! ✨</strong><br>Cheers, Team Poppin</p>
      <p style="font-size:12px;color:#7a6560;border-top:1px solid #ead9c0;padding-top:12px;margin-top:20px">Full terms: <a href="${SITE.url}/terms" style="color:#7a1f2e">${h(SITE.url.replace(/^https?:\/\//, ''))}/terms</a> · Queries: ${h(queriesPhone)}</p>`),
  };
}

export function bookingCancelledEmail({ refId, name, queriesPhone }) {
  return {
    subject: `Booking Cancelled - #${refId || 'N/A'} - PoppinFlea`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;color:#4a0d1a">Booking cancelled</h1>
      <p>Hi ${h(name)},</p>
      <p>We are sorry, but we had to cancel your reservation at PoppinFlea.</p>
      <p><strong>Reason:</strong> We are fully booked or there was an issue with your reservation.</p>
      ${refBox('Reference ID', `#${refId || 'N/A'}`)}
      <p style="color:#9a5b00;font-weight:bold">If you have already made the payment, please contact us immediately at ${h(queriesPhone)}.</p>
      <p>We hope to see you another time!</p>`),
  };
}

// ---------- Subscriber email ----------
export function subscribeEmail({ name, unsubscribeUrl }) {
  return {
    subject: 'You’re on the Poppin list 🎉',
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 12px;color:#4a0d1a">You’re in${name ? `, ${h(name)}` : ''}!</h1>
      <p>We’ll email you when there’s news about ${h(E.fullName)}: the venue reveal, brand line-up and anything you need to know before you visit.</p>
      <p style="font-size:12px;color:#7a6560;margin-top:24px">Changed your mind? <a href="${h(unsubscribeUrl)}" style="color:#7a1f2e">Unsubscribe in one click</a>.</p>`),
  };
}
