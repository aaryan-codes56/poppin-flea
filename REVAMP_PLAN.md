# Revamp Plan

## Goals

1. Make **Poppin Winter Carnival 2026** (23–25 Dec 2026, Patna, venue TBA) the focus of the site.
2. Turn "book a stall" into a real enquiry → CRM → confirmation workflow.
3. Present Poppin's genuine history: verified brands, partners and events only.
4. Fix the critical security problems found in the audit.
5. Keep the existing table-booking system, Google Sheets and email working.

## Design direction

- **Identity kept:** the Poppin' bubble wordmark (yellow + teal) is unchanged and used as the anchor. Pop-yellow is the primary CTA colour, so the brand stays recognisable.
- **Festive editorial layer:** deep burgundy, festive red, warm cream, forest green and muted gold; Fraunces (expressive variable serif, italic for emphasis) with Manrope for body text.
- **Signature details, used sparingly:** CSS string lights (echoing the fairy lights in Poppin's real photos), arched photo frames, a rotating "stamp", a ticket-style stall card, a marquee ribbon.
- **Real photography only** in editorial sections. The AI-generated stock images from the old site were removed from editorial use.
- Tokens for colour, type, spacing, radii, shadows and motion in `styles/globals.css`.

## Information architecture

| Route | Role |
|---|---|
| `/` | Promotes the carnival: hero + countdown, about, three days, stall CTA, brands, partners, events, what to expect, gallery, FAQ, Instagram, updates sign-up |
| `/winter-carnival` | Complete, shareable event page: full-screen hero, facts, stall info (with "awaiting confirmation" fields), categories, FAQ, contact, share buttons |
| `/book-a-stall` | Enquiry form + event facts + call/WhatsApp alternatives |
| `/brands`, `/past-events`, `/about`, `/contact` | Directory, archive, story + partners, contact routes |
| `/book` | Original table booking (config-driven, currently closed in production) |
| `/admin` | Hidden organiser dashboard |

## Architecture decisions

| Decision | Why |
|---|---|
| Stay on Next.js Pages Router + CSS Modules | It's what exists; a router migration adds risk without user value. |
| Google Sheets for everything (new tabs) | Organisers already use it; no new database is needed at this scale. |
| Storage abstraction with a local JSON driver | Development and testing never touch production data. |
| Server-side sessions via signed cookie (no auth library) | Small surface, no new dependency, works on serverless. |
| Content in `lib/data/*.js` with `published` flags | Verified-only content that's easy to edit; unverified entries stay hidden. |
| Event facts in `lib/config/event.js` | One place to set venue/timings/prices; UI and schema update automatically. |
| No animation library | CSS + IntersectionObserver covers it at zero bundle cost; reduced motion respected. |
| Plausible (optional) for analytics | Cookieless, no consent banner needed, no personal data. |

## Milestones (all completed locally)

1. Audit & brand research → `PROJECT_AUDIT.md`, `BRAND_RESEARCH.md`
2. Design system & UI → `styles/globals.css`, components
3. Winter Carnival page & countdown
4. Brands, partners, events, gallery
5. Stall enquiry system
6. Admin dashboard & security
7. Existing booking integration
8. SEO, motion, accessibility, performance
9. Testing, fixes, docs → `TESTING_REPORT.md`
10. Local demo, awaiting your review (nothing committed, pushed or deployed)
