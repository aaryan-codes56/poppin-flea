# Brand Research — Poppin / Poppin Fun & Flea

Research date: 10 November 2026.

## 1. Sources and access

| Source | Access | Notes |
|---|---|---|
| instagram.com/poppinflea | **Partial.** Logged-out view shows bio, counts, highlight names and the 12 most recent posts (author + alt text only, **no captions**). | Login was not attempted or bypassed. Older posts, reel captions and highlight contents were **not reviewed**. |
| poppinflea.in (live site) | Full | Previous event list, venue, past events. |
| Repository `public/` assets | Full | Real posters and event photos. |
| Jaano Junction article, 24 Dec 2024 | Full | Press coverage of the Christmas 2024 edition. |
| instagram.com/gardapatna | Partial | Organiser account; no captions visible. |
| Web search for Satvika and stall brands | Full | See §5. |

## 2. Brand identity (verified)

- **Name / wordmark:** "POPPIN'" with "FUN & FLEA" underneath (`public/logo.png`, transparent PNG). Bubble lettering, yellow `#F4D92F`-ish fill, teal `#4FC3C5`-ish sub-line, black outline and drop shadow.
- **Instagram bio:** "Bihar no. 1 event curators - Group Activities, Flea Markets, Parties and more." References @gardapatna. ~518 followers at time of research.
- **Organiser:** Garda Patna ("A Unit of Garda Media Pvt Ltd" on the Valentine poster). Instagram @gardapatna (Shubham Raj, verified, ~239K followers).
- **Instagram highlights:** "Poppin 🎄", "Poppin ❤️", "GHF 24'", "Param's land".

## 3. Previous events (verified)

| Event | Dates | Venue | Source | Notes |
|---|---|---|---|---|
| Poppin Christmas Flea | 23, 24, 25 Dec 2024, 3 PM onwards | Cafe Buddy's Espresso, SK Puri, Patna | Poster `christmas-flea-poster.jpg`; Jaano Junction 24 Dec 2024; live site | "Event by Garda Patna", free entry. Press: live music, local artisan stalls, handmade gifts, home decor, organic food, Christmas trinkets. |
| Poppin Valentine Edition | 12, 13, 14 Feb 2025 | Kiki Cafe, Patliputra Colony, Patna | Poster `valentine.jpg`; live site ("Kiki On The Roof") | 10+ stalls, make-your-own flower bouquet, live music, candle-light dinner, couple painting, blind date, free entry. |
| Garda Holi Festival | 9 March 2025, 2–7 PM | Panache Banquets, Saguna More, Patna | Poster `holi.jpg`; live site | Poppin credited under "Event By" with The Event Factory and Garda Patna. ⚠️ Instagram highlight "GHF 24'" suggests an earlier 2024 edition too; the year 2025 comes from the old website — **please confirm**. |
| Garda Garba | 2025 (exact date not on poster) | City Centre, Patna (per old site) | Poster `garba.jpg` ("Coming soon"); live site | Poppin logo on poster alongside Garda Patna and Premrajka Events. |
| Poppin Christmas at Cafe The Cartel | 24, 25, 26 Dec 2025, 4–9 PM | Cafe The Cartel, Vidyapati Marg, Patna | Live site; Instagram posts dated 24–28 Dec 2025 | Table bookings, open mic, live acoustic music. |

## 4. Partners (verified from posters / live site)

| Partner | Role | Event | Instagram |
|---|---|---|---|
| Garda Patna (Garda Media Pvt Ltd) | Official partner & co-presenter ("Poppin × Garda Patna presents") | All editions | @gardapatna (verified) |
| Satvika Celebration | Official Celebration Partner | Christmas 2025 | not verified |
| Dream Maker | Official Décor Partner | Christmas 2025 | not verified |
| Cafe Buddy's Espresso | Venue partner | Christmas 2024 | not verified |
| Kiki Cafe | Venue partner | Valentine 2025 | not verified |
| Cafe The Cartel | Venue partner | Christmas 2025 | not verified |
| IndianOil (XP95 / XtraGreen) | Presenting partner | Garda Holi Festival, Garda Garba | — |
| Winsome | Powered by | Garda Holi Festival | — |
| Rakesh Spices & Food Products | Co-powered by | Garda Holi Festival | — |
| Kasturi Jewellers, Bakerganj | Co-powered by | Garda Holi Festival | — |
| The Event Factory | Co-organiser | Garda Holi Festival | — |
| Evanta | Event associate | Garda Holi Festival | — |
| Visit Bihar | Travel partner | Garda Holi Festival | — |
| Empiro | Technology partner | Garda Holi Festival | — |
| Metagrafix | Branding partner | Garda Holi Festival | — |
| BookMyShow | Ticketing | Garda Holi Festival | — |
| Premrajka Events | Co-organiser | Garda Garba | — |

Only handles I could confirm are linked on the site. **Logos:** no standalone logo files exist in the repo, so the site shows typographic name plates instead of cropping low-resolution logos from posters. Drop real logo files into `public/partners/` and set `logo` in `lib/data/partners.js` to upgrade them.

## 5. Satvika Celebration and Dream Maker — verified (screenshots from the owner)

Two official partner posters from @poppinflea, shared by the project owner on 10 Nov 2026. Both are headed "Poppin × Garda Patna presents · Poppin' Fun & Flea · 2025 Edition · 24th 25th & 26th December · Cafe The Cartel, Income Tax Golamber · Last few stalls left! · 8709294143".

| Partner | Role on poster | Poster copy |
|---|---|---|
| **Satvika Celebration** | Official Celebration Partner | "We're excited to welcome Satvika Celebration as our official sponsor for Poppin' Fun & Flea! Together, we're bringing festive energy, vibrant experiences, and tons of holiday cheer!" |
| **Dream Maker** | Official Décor Partner | "From twinkling lights to candy-cane corners and immersive festive setups, they're bringing the season's spirit to life." |

- **Garda Patna** is confirmed as the official co-presenting partner ("Poppin × Garda Patna presents").
- My earlier web search could not find this because Instagram captions and older posts are hidden from logged-out visitors. The Satvika Group real-estate account (@satvikagroup) is **not** the same brand and is not used.
- Instagram handles for Satvika Celebration and Dream Maker are still unknown, so their name plates have no link. Add them as `url` in `lib/data/partners.js`.
- The poster images were shared in chat only, so they are not in the repo. To show the real logos, save them to `public/partners/` and set `logo`.

## 6. Participating brands

| Brand | Category | Evidence | Instagram | Published |
|---|---|---|---|---|
| House of Her Jewels | Jewellery | Collab posts with @poppinflea on 28 Dec 2025 | @houseofherjewels (confirmed) | ✅ |
| Sweet Fairy Patna | Bakery & desserts | Stall banner in `flea-stalls.jpg` | not found | ✅ (no link) |
| Haut de Scents (HDS) | Perfume & fragrance | Stall sign "HAUT DE SCENTS" in `flea-stalls.jpg`; "Saut de Scents – S8" in Poppin reel | not found | ✅ (no link) |
| Desi Mantra | Food products | Stall signage in `flea-stalls.jpg` | not found | ✅ (no link) |
| @greesuz_slice_of_art (Greeshma Cherukara) | Possibly art | Post on 25 Dec 2025 | — | ❌ (unclear if vendor or visitor) |
| @nehashares_, @being._.manya, @pinkjournalpages | Creators | Posts Dec 2025 | — | ❌ (content creators, not brands) |

### Added from the Poppin reel "Stalls to Must Visit at Poppin" (26 Dec 2025)

Source: https://www.instagram.com/reel/DSuCfWdjypB/ (collab @poppinflea × @gardapatna). On-screen list: Nirva Nook – T3, Saut de Scents – S8, Femora Candles – T2, Lady With Jewellers – T2, Saanjh – T1, Lumetia Candles – T5, Words & Pages – S7, "Quirk…" (cut off, not published). Categories are set only where the name states it (candles, jewellers, pages); Nirva Nook and Saanjh show "Stall at Poppin" until you confirm what they sell. Instagram handles still needed.

With 10 published brands, the category filter on `/brands` now switches on automatically.

## 7. What I need from you

1. Instagram handles for Sweet Fairy Patna, Haut de Scents, Desi Mantra, Nirva Nook, Femora Candles, Lady With Jewellers, Saanjh, Lumetia Candles and Words & Pages, plus what Nirva Nook and Saanjh sell.
2. A list of vendors from previous editions (the stall sheet you used is ideal).
3. Instagram handles (and logo files) for Satvika Celebration and Dream Maker.
4. The year of Garda Holi Festival (2024 vs 2025) and the Garda Garba date.
5. Real logo files for partners, and more event photos (high resolution, ≥1600 px) for the gallery and hero.
6. The Winter Carnival 2026 poster image. It was mentioned as attached but did not come through, so the event copy uses the text from your brief word for word.
