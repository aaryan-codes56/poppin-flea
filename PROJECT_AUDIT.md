# Project Audit — Poppin website (before the revamp)

Audit date: 10 November 2026. Audited commit: `cca4ba1` on `main`.

## 1. What the project is

A small Next.js app that ran the **table-booking system** for the Poppin Christmas edition at Cafe The Cartel (24–26 December 2025). Visitors booked a 45-minute table slot, paid by UPI QR, uploaded a payment screenshot, and organisers verified the payment in an admin table.

## 2. Technology stack (as found)

| Area | Choice |
|---|---|
| Framework | Next.js 16.0.7, **Pages Router**, React 19.2 |
| Language | JavaScript (no TypeScript), `@/*` path alias in `jsconfig.json` |
| Styling | CSS Modules + `styles/globals.css`, Poppins from Google Fonts via `<link>` |
| Data | Google Sheets API v4 (`googleapis`), single tab `Sheet1`, columns A–N |
| File uploads | `formidable` → Cloudinary (payment screenshots) |
| Email | Nodemailer 7 over Gmail SMTP |
| Auth | Hard-coded credentials checked **in the browser**, `localStorage.isAdmin = 'true'` |
| Deployment | Vercel (inferred from `.gitignore` and live site); no CI or workflow files in the repo |
| Tests / lint | None |

## 3. Routes

| Route | Purpose |
|---|---|
| `/` | Hero, four feature cards, three Dec 2025 dates, past events, venue (Cafe The Cartel) |
| `/book` | Table booking form + UPI QR payment modal |
| `/terms` | Table reservation T&Cs |
| `/admin/login` | Client-side login |
| `/admin` | Bookings table, status buttons, on-spot registration |
| `POST /api/createBooking` | Multipart form → Cloudinary → capacity check → append to Sheet1 → email |
| `GET /api/getSlots` | Per-slot, per-area capacity for a date |
| `GET /api/getBookings` | **All bookings incl. names, phones, emails, payment screenshots** |
| `POST /api/updateBookingStatus` | Write any string into column N of any row |
| `POST /api/cancelBooking` | Set row to Cancelled + email the customer |
| `POST /api/confirmPayment` | Set row to Reserved + email an address **taken from the request body** |

Sheet1 layout (must be preserved): `Ref ID | Name | Phone | Email | Area | Date | Time Slot | Adults | Children | Comments | Transaction ID | UPI Name | Screenshot Link | Status`.

## 4. What works

- The booking flow end to end (form → capacity check → sheet → pending email → admin verify → confirmed email).
- Capacity logic per area/slot, ignoring cancelled rows.
- Email templates and reference IDs.
- Real event photography and posters in `public/`.

## 5. Security problems (ranked)

| # | Severity | Problem | Fix in revamp |
|---|---|---|---|
| S1 | **Critical** | Every admin API is unauthenticated. Anyone can `GET /api/getBookings` and download every customer's name, phone, email and payment screenshot, or cancel/confirm any booking. | Signed HttpOnly session cookie, checked server-side on every admin API. |
| S2 | **Critical** | Admin password `admin123` and email are hard-coded in the client bundle (`pages/admin/login.js`); "login" is a `localStorage` flag anyone can set. | Server-side login, scrypt password hash in env, no credentials in frontend. |
| S3 | **Critical** | Cloudinary API key **and secret** hard-coded in `scripts/test_cloudinary.js`, committed in `ab4d22c` and pushed to GitHub. | Removed from the file. **The secret is still in Git history and must be rotated in the Cloudinary console** (history was not rewritten, as instructed). |
| S4 | Critical | Next.js 16.0.7 had multiple critical advisories (unauthenticated RCE in image optimisation, middleware bypass, SSRF). | Upgraded to 16.4.6 (same major). `npm audit` now reports 0 vulnerabilities. |
| S5 | High | `createBooking` with `isOnSpot=true` skips the payment-screenshot requirement for anyone. | On-spot bookings now require an admin session. |
| S6 | High | `confirmPayment` emails whatever address/details the client sends. | Row is read from the sheet server-side. |
| S7 | High | Nodemailer 7 had address-parser / header-injection advisories. | Upgraded to 10.5. |
| S8 | Medium | User input interpolated raw into email HTML (HTML injection). | All values HTML-escaped. |
| S9 | Medium | `createBooking` logs full form fields (PII) to server logs; `scripts/check_env.js` prints the entire `.env.local`. | Logging removed / secrets masked. |
| S10 | Medium | `updateBookingStatus` accepts any status string. | Whitelisted statuses. |
| S11 | Low | No rate limiting, no security headers, admin indexable. | In-memory rate limiter, security headers, `noindex` + robots disallow. |

## 6. Other bugs and debt

- Booking dates are hard-coded to 2025 in three files (`book.js`, `admin/index.js`, `createBooking.js`). The 2025 edition is over, so the live site currently advertises a past event.
- Reference IDs are `rows.length` — two simultaneous bookings can get the same ID. (Kept for compatibility; documented.)
- Google auth client and transporter re-created and copy-pasted in every route.
- `styles/Home.module 2.css` is an unused duplicate (Finder copy).
- `/terms` email link points to `poppinflea.com` while the site is `poppinflea.in`.
- Admin page passes array index to optimistic updates and mutates state in place.
- Three "feature" images (`flea-food.png`, `flea-music.png`, `flea-vibe.png`) are AI-generated stock, not Poppin photography, and were presented as if they were. (Removed in the revamp.)
- No SEO (one generic title, no OG, no sitemap), no accessibility labels on the modal close button, emoji used as icons.
- Public "Admin" link in the navbar.

## 7. Reuse vs. redesign decisions

| Keep | Redesign | Remove / archive |
|---|---|---|
| Next.js Pages Router, CSS Modules, Google Sheets, Nodemailer, Cloudinary, Sheet1 layout, booking logic, email copy, real photos and posters, logo | Entire UI and design system, admin dashboard, auth, data access layer, email templates (escaped, branded) | Public admin link, hard-coded 2025 dates (moved to config), AI stock images from editorial sections, duplicate CSS |

No new database was introduced: vendor enquiries, announcements and subscribers live in **separate tabs of the same spreadsheet**. A local JSON driver is used in development so local testing never touches production data.
