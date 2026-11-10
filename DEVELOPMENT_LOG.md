# Development Log

All work was done locally on 10 November 2026. Nothing was committed, pushed or deployed.

## 1. Audit & research
- Read the whole repo, live site and available public sources. Findings → `PROJECT_AUDIT.md`.
- Instagram was only partly visible without login (12 recent posts, no captions). Login was not attempted.
- The owner then shared two official 2025 partner posters, confirming **Satvika Celebration** (Official Celebration Partner), **Dream Maker** (Official Décor Partner) and **Garda Patna** as the co-presenting official partner. Research trail → `BRAND_RESEARCH.md`.

## 2. Dependencies
- `next` 16.0.7 → **16.4.6** (same major) — fixes critical advisories (unauthenticated RCE, middleware bypass, SSRF).
- `react` / `react-dom` → 19.3.1, `nodemailer` 7 → **10.5** (address-parser/header-injection advisories).
- `npm audit fix` for transitive packages. Result: **0 vulnerabilities**. No new runtime dependencies were added.

## 3. Security fixes
- Server-side admin auth (scrypt hashes, HMAC-signed HttpOnly SameSite=Strict cookie, 8 h), roles (admin/staff), Origin check on writes, rate limits on login, public forms and admin APIs.
- All admin APIs wrapped in `withAdmin`; `/admin` checks the session on the server.
- Removed the hard-coded Cloudinary secret from `scripts/test_cloudinary.js` (**the secret remains in Git history and must be rotated**). `check_env.js` no longer prints secrets.
- On-spot bookings require a session; `confirmPayment` reads booking data from the sheet, not the request; status values whitelisted; uploads limited to images ≤ 5 MB; emails HTML-escaped; formula-injection protection for Sheets and CSV; PII logging removed; security headers; admin/API `noindex`.

## 4. Data layer
- `lib/server/store.js`: one tab per collection in the existing spreadsheet (`Vendor Enquiries`, `Announcements`, `Subscribers`), or `.data/*.json` locally.
- `lib/server/bookings.js`: table bookings, same Sheet1 layout (A–N), with a local driver.
- Development defaults: `DATA_DRIVER=local`, `EMAIL_DRIVER=log`; Cloudinary uploads skipped in local mode.

## 5. UI
- New design system, layout, 9 public pages, 404, sitemap, robots, OG image (`public/og/winter-carnival-2026.jpg`) and a trimmed logo (`public/brand/poppin-logo.png`) generated from the existing logo.
- Removed old CSS modules, old Navbar/Footer, the duplicate `Home.module 2.css` and the unused Next starter SVGs.

## 6. Incidents & fixes during testing
- **Production spreadsheet touched once (unintended).** The first `npm run build` ran in production mode with `.env.local`, so the homepage's build-time read created an empty **"Announcements" tab with a header row** in the live spreadsheet. A read-only check confirmed nothing else changed (`Sheet1` untouched). Fixes: reads can no longer create tabs (only writes do), tab creation is safe under concurrent requests, and `npm run build:local` / `start:local` force local drivers. The empty tab was left in place; production would create the same tab on first use, and you can delete it.
- Hydration mismatch from floating-point differences in the string-lights SVG → coordinates rounded.
- Horizontal overflow at 360 px on three pages → grids changed to `minmax(0, 1fr)`, decorative stamp kept inside the card.
- Double-click on the enquiry form created two records → client in-flight guard + server per-key lock (verified: 3 parallel requests → 1 record).
- Stall-booking steps list rendered one word per line → markup fixed.
- Low-contrast gold eyebrows, muted text on red and the WhatsApp button → colours adjusted to meet WCAG AA.
- Next 16.4 dev auto-generated an `AGENTS.md` → removed and disabled with `agentRules: false`.
- Replaced the deprecated `priority` image prop with `preload` + `loading="eager"` on above-the-fold images.

## 7. Round 2 (owner feedback, same day)
- **Simple local login:** username `admin`, password set in `.env.development.local` (local only; production uses its own hash in Vercel). Login field now accepts a plain username.
- **Stall booking only:** `NEXT_PUBLIC_TABLE_BOOKING_ENABLED=false`. `/book` redirects to `/book-a-stall` (server-side), the dashboard hides the table-booking tab and stats, the table-reservation terms are hidden, and the booking API refuses public table bookings. All table-booking code is kept for later.
- **Dashboard:** one-tap status buttons (Contacted, Interested, Approved, Payment Pending, Confirmed, Rejected) in the enquiry details panel.
- **Instagram:** 12 public posts and reels from the @poppinflea grid shown through Instagram's official embeds (`lib/data/instagram.js`, `components/ui/InstagramCarousel.js`) on the homepage and `/past-events`. Nothing is downloaded or re-hosted; embeds load only when scrolled into view. Privacy policy updated.
- **Brand corrections from Instagram:** the stall sign reads **Haut de Scents** (perfume), not "Hout de Scents". Added six brands listed in Poppin's own reel "Stalls to Must Visit at Poppin": Nirva Nook, Femora Candles, Lady With Jewellers, Saanjh, Lumetia Candles, Words & Pages. 10 brands → category filters switched on.
- **Motion:** `components/ui/motion.js` (no new dependencies): CSS snowfall, word-by-word headline reveal, pointer parallax on the hero collage, Ken Burns hero photo, 3D tilt + glare on cards, count-up stats strip, countdown digit tick, scroll progress bar, auto-hiding navbar, button shine, partner-name marquee, confetti on a successful enquiry. All respect `prefers-reduced-motion`.
- **Gallery:** supports short videos (`video:` field) with hover preview and a lightbox player.
- Fixed: Turbopack cache corruption after a parallel build (cleared `.next`); `getStaticProps` redirect not allowed at build time → moved `/book` to `getServerSideProps`; React key warning in the headline splitter.

## 8. Mobile fixes (11 Nov 2026)
- **Navbar cut off on small phones:** three elements were wider than a 320 px screen (stats-strip button, "Venue to be announced" badge on the carnival page, a partner card), which made the whole page wider than the phone. Fixed each one and added a page-wide guard (`overflow-x: clip`). The navbar no longer auto-hides on phones/tablets, and the open mobile menu drops the blur so it can't get trapped on iOS.
- **Footer links not responding:** the sticky bottom "Book a stall / WhatsApp / Call" bar sat on top of the footer links. It now hides whenever the footer is on screen and while a form field is focused. Footer links are 44 px tall tap targets. The dev-only Next.js badge is disabled (it covered "Privacy policy" locally).
- **Form tapping issues:** error messages no longer pop in when leaving a field (they moved the next field mid-tap); errors show on submit. Removed the tap delay (`touch-action: manipulation`), added scroll margins so focused fields aren't hidden under the navbar, and made the consent row a larger target.
- **Local dev crashes:** iCloud Desktop sync was creating duplicate files ("LOG 2") inside the Next.js cache. The cache now lives in `.next.nosync` (ignored by iCloud), with `.next` as a symlink, local only.
- README rewritten as a project showcase with screenshots; local test password removed from public docs.
