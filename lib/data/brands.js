// Brands that have taken part in previous Poppin markets.
//
// RULES
// - Only add a brand when there is evidence (stall photo, collab post, vendor list).
// - Record the evidence in `source`. Leave `instagram` null until the handle is confirmed.
// - `published: false` keeps an entry out of the public site.
// - `logo` is a path in /public (e.g. '/brands/house-of-her-jewels.png'). Without it a
//   typographic name plate is shown.
// See BRAND_RESEARCH.md for the research trail.

export const BRANDS = [
  {
    slug: 'house-of-her-jewels',
    name: 'House of Her Jewels',
    category: 'Jewellery & accessories',
    instagram: 'houseofherjewels',
    logo: null,
    event: 'Poppin Christmas 2025',
    blurb: 'Waterproof, hypoallergenic, anti-tarnish 18k gold-plated jewellery.',
    source: 'Collab posts with @poppinflea, 28 Dec 2025',
    spotlight: true,
    published: true,
  },
  {
    slug: 'sweet-fairy-patna',
    name: 'Sweet Fairy Patna',
    category: 'Bakery & desserts',
    instagram: null,
    logo: null,
    event: 'Poppin Christmas edition',
    blurb: '3D, customised, fondant and wedding cakes, plus Christmas specials at the stall.',
    source: 'Stall banner visible in Poppin stall photo (public/flea-stalls.jpg)',
    spotlight: true,
    published: true,
  },
  {
    slug: 'haut-de-scents',
    name: 'Haut de Scents',
    category: 'Perfume & fragrance',
    instagram: null,
    logo: null,
    event: 'Poppin Christmas edition',
    blurb: 'Perfume brand with its own stall at the Poppin Christmas market.',
    source: 'Stall sign "HAUT DE SCENTS" in public/flea-stalls.jpg; listed as "Saut de Scents – S8" in @poppinflea reel DSuCfWdjypB (26 Dec 2025)',
    spotlight: true,
    published: true,
  },
  {
    slug: 'desi-mantra',
    name: 'Desi Mantra',
    category: 'Food & beverages',
    instagram: null,
    logo: null,
    event: 'Poppin Christmas edition',
    blurb: 'Packaged food products in jars, shown at the Christmas market.',
    source: 'Stall signage visible in Poppin stall photo (public/flea-stalls.jpg)',
    spotlight: false,
    published: true,
  },

  // ---- From the @poppinflea reel "Stalls to Must Visit at Poppin" (26 Dec 2025,
  // https://www.instagram.com/reel/DSuCfWdjypB/). Stall numbers as shown in the reel.
  // Categories are only set where the brand name states it.
  { slug: 'nirva-nook', name: 'Nirva Nook', category: null, instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall T3 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  { slug: 'femora-candles', name: 'Femora Candles', category: 'Candles & home decor', instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall T2 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  { slug: 'lady-with-jewellers', name: 'Lady With Jewellers', category: 'Jewellery & accessories', instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall T2 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  { slug: 'saanjh', name: 'Saanjh', category: null, instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall T1 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  { slug: 'lumetia-candles', name: 'Lumetia Candles', category: 'Candles & home decor', instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall T5 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  { slug: 'words-and-pages', name: 'Words & Pages', category: 'Books & stationery', instagram: null, logo: null, event: 'Poppin Christmas 2025', blurb: 'Stall S7 at Poppin Christmas 2025.', source: 'Reel DSuCfWdjypB', spotlight: false, published: true },
  {
    slug: 'greesuz-slice-of-art',
    name: 'Greesuz Slice of Art',
    category: 'Art & handmade',
    instagram: 'greesuz_slice_of_art',
    logo: null,
    event: 'Poppin Christmas 2025',
    blurb: '',
    source: 'Video post on @poppinflea grid, 25 Dec 2025 — unclear if vendor or visitor',
    spotlight: false,
    published: false,
  },
];

// Category filters only appear once there are enough brands to make them useful.
export const MIN_BRANDS_FOR_FILTERS = 8;

export function publishedBrands() {
  return BRANDS.filter((b) => b.published);
}

export function brandCategories(list = publishedBrands()) {
  return [...new Set(list.map((b) => b.category).filter(Boolean))].sort();
}
