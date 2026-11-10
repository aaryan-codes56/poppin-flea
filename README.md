# Poppin — website & organiser tools

The website for **Poppin (Poppin' Fun & Flea)**, Patna's community flea market and lifestyle events platform, presented with Garda Patna. It promotes **Poppin Winter Carnival 2026 (23–25 December 2026, Patna — venue to be announced)**, takes stall enquiries, and gives organisers a private dashboard.

## Features

**Public site**
- Homepage, `/winter-carnival` landing page, `/book-a-stall`, `/brands`, `/past-events`, `/about`, `/contact`, `/privacy`, `/terms`
- Live countdown to 00:00 IST on 23 Dec 2026, switching to "live" and "wrap" messages automatically
- Stall enquiry form with client- and server-side validation, unique reference (`PWC26-XXXXXX`), duplicate protection, confirmation and organiser emails
- Click-to-call and pre-filled WhatsApp links everywhere stall booking is promoted
- Verified brand directory with category filters, past partners (separate from brands), event archive, photo/video gallery with lightbox
- Instagram reels and posts from Christmas 2025 via Instagram's official embeds (loaded only when scrolled into view)
- Motion: snowfall, word-by-word headlines, mouse-follow parallax, tilting cards, count-up stats, ticking countdown, scroll progress bar, partner marquee, confetti on enquiry success, all disabled for reduced-motion users
- Announcements managed from the dashboard (venue reveal, partners, updates)
- Email updates subscription with consent and one-click signed unsubscribe
- SEO: per-page titles/descriptions, Open Graph image, canonical URLs, `sitemap.xml`, `robots.txt`, Event/Organization/FAQ JSON-LD
- Optional cookieless analytics (Plausible) with CTA, contact, enquiry-start and enquiry-submit events

**Organiser dashboard (`/admin`, not linked anywhere)**
- Server-side login (scrypt-hashed passwords in env, signed HttpOnly session cookie, 8-hour sessions)
- Overview: total / new / contacted / approved / confirmed enquiries, follow-ups due, category and source breakdowns
- Vendor CRM: search, filter by status and category, detail drawer, status pipeline, follow-up dates, internal notes with activity log, CSV export
- Customer table bookings (original system, hidden while `NEXT_PUBLIC_TABLE_BOOKING_ENABLED` is off): verify payment, guest arrived, cancel, on-spot registration
- Announcements editor and subscriber list (admin role only)

## Tech stack

Next.js 16 (Pages Router) · React 19 · CSS Modules + design tokens · `next/font` (Fraunces + Manrope) · Google Sheets API · Nodemailer (Gmail) · Cloudinary (payment screenshots) · formidable. No database beyond the existing spreadsheet.

## Folder structure

```
components/
  admin/      dashboard panels (enquiries CRM, table bookings, announcements, subscribers)
  forms/      stall enquiry form, newsletter
  layout/     Layout, Navbar, Footer, Seo, PageHeader
  sections/   homepage / event sections (hero, brands, partners, events, …)
  ui/         Icon, Countdown, Gallery, Faq, Reveal, StringLights, ShareButtons, …
lib/
  config/     site.js (contacts), event.js (Winter Carnival facts), tableBooking.js, crm.js
  data/       brands.js, partners.js, events.js, gallery.js, faqs.js  ← edit content here
  server/     auth, storage (Sheets / local JSON), bookings, mailer, validation, rate limiting
pages/        routes; pages/api/* are API routes
public/       images, logo, OG image, robots.txt
scripts/      maintenance scripts, password hasher, API smoke test
styles/       globals.css (design tokens), pages.module.css
```

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000
```

`.env.development.local` (gitignored) makes development safe by default:
- `DATA_DRIVER=local` — data goes to `.data/*.json`, **never** the production Google Sheet
- `EMAIL_DRIVER=log` — emails are printed in the terminal, **not sent**
- a local admin login: **username `admin`, password `poppin2026`** (local testing only)
- `NEXT_PUBLIC_TABLE_BOOKING_ENABLED=false` — stall booking only for now; set `true` later to bring table bookings back

Delete `.data/` to reset local data.

To test a production build locally **without touching live data**:

```bash
npm run build:local    # forces DATA_DRIVER=local, EMAIL_DRIVER=log
npm run start:local    # http://localhost:3001
```

> ⚠️ Plain `npm run build` / `npm start` read `.env.local`, which holds **production** credentials, and will use the live Google Sheet.

API smoke test (localhost only): `npm run test:api -- poppin2026`, then `rm -rf .data`.

## Environment variables

See `.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEET_ID` | Service account + spreadsheet |
| `EMAIL_USER`, `EMAIL_PASS`, `ORGANISER_EMAIL` | Gmail sender (App Password) and where new enquiries are notified |
| `CLOUDINARY_*` | Payment screenshot uploads for table bookings |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Admin login (required — login is disabled without them). `ADMIN_EMAIL` can be a plain username such as `admin`. |
| `STAFF_EMAIL`, `STAFF_PASSWORD_HASH` | Optional limited login |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (default `https://www.poppinflea.in`) |
| `NEXT_PUBLIC_TABLE_BOOKING_ENABLED` | `true` to open public table bookings |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional cookieless analytics |
| `DATA_DRIVER`, `EMAIL_DRIVER` | `local`/`sheets`, `log`/`smtp` (defaults depend on NODE_ENV) |

Generate an admin password hash and session secret:

```bash
npm run hash-password -- "a-long-unique-password"
```

## Google Sheets setup

One spreadsheet, shared (Editor) with the service account email.

| Tab | Created | Used for |
|---|---|---|
| `Sheet1` | existing | Customer table bookings — columns A–N unchanged: `Ref ID, Name, Phone, Email, Area, Date, Time Slot, Adults, Children, Comments, Transaction ID, UPI Name, Screenshot Link, Status` |
| `Vendor Enquiries` | automatically on the first enquiry | Stall enquiries + CRM fields |
| `Announcements` | automatically on first create | Dashboard announcements |
| `Subscribers` | automatically on first sign-up | Email update subscribers |

Reads never create tabs; only writes do. New tabs are written with `RAW` input so user text can't become a formula.

## Email

Gmail SMTP via Nodemailer. Use a Google **App Password** for `EMAIL_PASS`. Emails sent: stall enquiry confirmation (vendor), new enquiry notification (organiser), table booking received / confirmed / cancelled, subscription confirmation. Email failures are logged and never block a submission.

## Admin access

Go to **`/admin`** directly; there are no public links. Without a valid session the page shows only the login form, and every admin API independently returns `401`. Roles:

- **admin**: everything, including CSV export, announcements, subscribers
- **staff**: view and update enquiries and table bookings

## Updating content

- Event facts (venue, timings, stall prices once confirmed): `lib/config/event.js`. Setting `venue` switches every "Venue to be announced" label and the Event schema automatically.
- Instagram reels/posts shown on the site: `lib/data/instagram.js` (paste the post link).
- Gallery photos and short videos: `lib/data/gallery.js` + files in `public/gallery/`.
- Brands / partners / past events / gallery / FAQ: `lib/data/*.js`. Only add brands and partners you can verify; `published: false` hides an entry.
- Contact number and WhatsApp messages: `lib/config/site.js`.

## Deployment (for later — not done as part of this revamp)

Built for Vercel (or any Node host):
1. Add all production env vars in the hosting dashboard (never commit them).
2. Make sure `ADMIN_*` and `SESSION_SECRET` are set, or admin login stays disabled.
3. **Rotate the Cloudinary API secret** first — an old secret was committed in `scripts/test_cloudinary.js` (see `PROJECT_AUDIT.md`).
4. Deploy. The homepage and carnival page are statically generated and refresh every 2 minutes, or immediately when an announcement changes.

Rate limiting is in-memory per server instance; for strict limits on serverless, back `lib/server/rateLimit.js` with a shared store (e.g. Upstash Redis).

## Project docs

`PROJECT_AUDIT.md` · `BRAND_RESEARCH.md` · `REVAMP_PLAN.md` · `FEATURE_ROADMAP.md` · `DEVELOPMENT_LOG.md` · `TESTING_REPORT.md`
