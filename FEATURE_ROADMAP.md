# Feature Roadmap

## Built in this revamp

| Feature | Status | Notes |
|---|---|---|
| A. Vendor CRM | ✅ | Pipeline statuses, notes, follow-ups, search/filter, CSV export, overview stats |
| B. Vendor category directory | ✅ | `/brands`; category filters appear automatically at 8+ verified brands |
| C. Event archive | ✅ | `/past-events`, grouped by year |
| D. Event updates | ✅ | Announcements section on home + carnival page, published items only |
| E. Updates subscription | ✅ | Consent checkbox, confirmation email, signed one-click unsubscribe, admin list + CSV |
| F. WhatsApp integration | ✅ | Pre-filled stall message, sticky mobile bar, success-screen follow-up, admin quick-reply |
| G. Event analytics | ✅ (needs config) | Plausible events: `cta_click`, `contact_click`, `enquiry_form_started`, `enquiry_submitted`, `enquiry_failed`, `subscribe`, `share`. UTM/referrer stored on each enquiry → "where vendors came from" chart. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to switch on. |
| H. SEO-ready event pages | ✅ | Config-driven event, Event JSON-LD, sitemap. A future edition = new config + page. |
| I. Vendor spotlight | ✅ | Brand cards with category, blurb, event, Instagram |
| J. Announcement management | ✅ | Admin create/edit/publish/pin/delete; pages refresh immediately |

## Later (switched off for now)

- **Customer table bookings**: fully built and kept; set `NEXT_PUBLIC_TABLE_BOOKING_ENABLED=true` and update the edition/dates in `lib/config/tableBooking.js` when you want them back.

## Waiting on information from you

- Venue, daily timings and stall pricing/sizes/inclusions → `lib/config/event.js`
- Instagram handles and logos for brands and partners (see `BRAND_RESEARCH.md` §7)
- More high-resolution event photos for the hero and gallery
- The Winter Carnival 2026 poster image

## Suggested next steps (not built)

| Idea | Value | Effort |
|---|---|---|
| Send announcements to subscribers by email from the dashboard | High once the venue is revealed | Medium (needs a bulk-email provider such as Resend/Brevo; Gmail has daily limits) |
| Shared rate-limit store (Upstash Redis) | Stronger abuse protection on serverless | Low |
| Online stall payment (Razorpay) after approval | Faster confirmations | Medium; needs pricing + business account |
| Vendor-facing status page (enter reference → see status) | Fewer "any update?" calls | Low–medium |
| Visitor RSVP / interest counter | Social proof + footfall planning | Low |
| Per-edition landing pages generated from config (e.g. `/events/[slug]`) | Reuse for Valentine's, Holi, etc. | Medium |
