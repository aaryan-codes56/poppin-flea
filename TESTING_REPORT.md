# Testing Report

Date: 10 November 2026. Environment: macOS, Node 26.9, Next.js 16.4.6 dev server at `http://localhost:3000` with `DATA_DRIVER=local` and `EMAIL_DRIVER=log`. Browser checks used headless Google Chrome. All data was test data and has been cleared (`.data/` deleted).

## Summary

| Area | Result |
|---|---|
| Production build (`npm run build:local`) | ✅ Compiles, 13 static pages generated |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| API smoke test (`scripts/api-smoke-test.mjs`) | ✅ 65 / 65 |
| All routes respond | ✅ 200 for every page, 307 `/admin/login` → `/admin`, 404 for unknown routes |
| Console errors (home, carnival, inner pages, admin) | ✅ None after fixes |
| Horizontal overflow at 360 / 390 / 1280 / 1440 px | ✅ 0 px on every page |
| Countdown states | ✅ See below |
| Google Sheets (live) | ⚠️ Write paths not tested against the live sheet on purpose; see "Not tested" |
| Real email delivery | ⚠️ Not tested on purpose; emails rendered and logged locally |

## API smoke test (65 checks)

**Security:** anonymous access → 401 for every admin endpoint (10 checks) · forged session cookie rejected · `/admin` shows only the login without a session and sends `noindex` · wrong password 401 · login rate-limited · cookie is HttpOnly + SameSite=Strict · staff login · cross-site PATCH blocked (CSRF) · staff can't export CSV or manage announcements · on-spot booking without session → 401 · logout clears cookie.

**Stall enquiries:** empty form → 8 field errors · invalid phone · unknown category · missing consent · honeypot silently dropped · valid enquiry → 201 + `PWC26-XXXXXX` · duplicate returns the same reference · HTML stored as text · rate-limited per IP · phone normalised (`+91 98765 43210` → `9876543210`) · Instagram URL → handle · UTM source captured.

**CRM:** new enquiry shows as `New` · invalid status rejected · status/follow-up/note update with activity log · CSV export with formula neutralisation.

**Announcements:** create · `javascript:` links rejected · published item appears on homepage · unpublished hidden · delete.

**Subscriptions:** subscribe with consent · without consent rejected · forged unsubscribe token rejected · admin sees subscriber. Valid signed unsubscribe also tested separately ✅.

**Table bookings (original flow):** slot availability returns counts only · unknown dates rejected · booking without screenshot rejected · booking created (`#001`, Pending Verification) · admin on-spot booking (`#002`) · capacity limit enforced · verify payment → Reserved (spoofed email in request ignored) · formula-like status rejected · guest arrived · cancel · statuses persisted.

**SEO:** Event JSON-LD with `startDate 2026-12-23` / `endDate 2026-12-25` · OG image + canonical · no `/admin` links in public HTML · sitemap excludes admin.

## Browser tests

| Test | Result |
|---|---|
| Stall form: empty submit shows 8 inline errors and focuses the first field | ✅ |
| Stall form: full submission → success screen with reference, WhatsApp follow-up | ✅ |
| Stall form: double click → one record | ✅ (after fix) |
| Mobile menu opens, focus trapped, Esc closes, current page highlighted | ✅ |
| Admin login → overview stats, enquiry drawer, update + notes | ✅ |
| Gallery lightbox (keyboard ←/→/Esc, focus return) | ✅ implemented; checked visually on desktop |
| Sticky mobile CTA appears after first screen | ✅ |
| Hero, carnival, brands, partners, events, about, contact layouts (desktop + mobile) | ✅ reviewed via screenshots |

### Countdown (clock faked in the browser)

| Simulated time (IST) | Shown |
|---|---|
| 22 Dec 2026 23:59:30 | `00 Days 00 Hours 00 Minutes 26 Seconds` |
| 23 Dec 2026 00:00:01 | "The Winter Carnival is happening now — see you in Patna!" |
| 25 Dec 2026 23:00 | Same "happening now" message |
| 26 Dec 2026 00:00:05 | "That's a wrap on Poppin Winter Carnival 2026…" |
| Real time (10 Nov 2026 ~22:30) | 42 days 1 hour (correct) |

No negative values in any state.

### Accessibility

- Semantic landmarks, skip link, one `h1` per page, labelled form fields with `aria-invalid` / `aria-describedby`, accordion with `aria-expanded`, dialogs with `aria-modal` and Esc.
- Contrast: all key text pairs ≥ 4.5:1 after adjustments (e.g. eyebrow gold 5.7:1, WhatsApp button 5.4:1).
- `prefers-reduced-motion` disables animations; scroll-reveal content stays visible without JS.

## Not tested (and why)

| Item | Reason | How to verify before launch |
|---|---|---|
| Writes to the live Google Sheet (`Vendor Enquiries`, `Subscribers`, booking status changes) | Avoid polluting production data | Use a copy of the spreadsheet: set `GOOGLE_SHEET_ID` to the copy, `DATA_DRIVER=sheets`, submit one enquiry |
| Real Gmail delivery | Avoid sending real emails | With the copy above, set `EMAIL_DRIVER=smtp` and submit with your own email |
| Cloudinary upload | Skipped in local mode; the old secret must be rotated first | After rotating, run `node scripts/test_cloudinary.js` |
| Lighthouse scores | No Lighthouse CLI in this environment | Run Lighthouse in Chrome DevTools on `npm run start:local` |
| Real iOS/Android devices | Emulated at 360/390 px only | Open `http://<your-LAN-IP>:3000` on a phone |

The one live-sheet side effect from this session (an empty "Announcements" tab) is described in `DEVELOPMENT_LOG.md` §6.

## Round 2 re-test (stall-only mode)

| Check | Result |
|---|---|
| `npm run build:local` | ✅ |
| API smoke test (`npm run test:api -- <local admin password>`) | ✅ 52 / 52 (staff checks skipped, since no staff login is configured locally; table bookings confirmed closed: public booking → 403, `/book` → `/book-a-stall`) |
| Local admin login | ✅ |
| Console errors, 8 pages × 360 px and 1440 px | ✅ none |
| Horizontal overflow, same pages | ✅ 0 px |
| Instagram carousel | ✅ all 12 embeds load in Chrome (598 px players) |
| Stall form → confetti + reference, double click → 1 record | ✅ |
| Brand category filters on `/brands` | ✅ shown (10 brands) |

## Mobile re-test (11 Nov 2026), touch-emulated
| Check | Result |
|---|---|
| Page width = screen width at 320 / 360 / 375 / 390 / 414 px, every page | ✅ |
| Navbar fully visible at 320 px; stays visible while scrolling on phones | ✅ |
| Mobile menu → every link navigates with real taps | ✅ |
| Every footer link navigates with real taps at 320 px; nothing covering them | ✅ |
| Stall form filled by tapping and typing at 320 px → submitted, reference shown, saved | ✅ |
| API smoke test | ✅ 52 / 52 |
| Production build | ✅ |
