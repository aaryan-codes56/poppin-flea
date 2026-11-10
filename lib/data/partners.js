// Organisers, venue partners and sponsors of previous Poppin events.
// Kept separate from participating brands on purpose.
// Evidence for every entry is in BRAND_RESEARCH.md §4.

export const PARTNERS = [
  {
    slug: 'garda-patna',
    name: 'Garda Patna',
    role: 'Official partner & co-presenter',
    detail: 'Poppin × Garda Patna present every edition. A unit of Garda Media Pvt Ltd.',
    events: ['All Poppin editions'],
    url: 'https://www.instagram.com/gardapatna/',
    logo: null,
    tier: 'lead',
    published: true,
  },
  {
    // Source: official "2025 Edition" partner poster on @poppinflea.
    slug: 'satvika-celebration',
    name: 'Satvika Celebration',
    role: 'Official Celebration Partner',
    detail: 'Official sponsor of Poppin’ Fun & Flea, bringing festive energy, vibrant experiences and holiday cheer.',
    events: ['Poppin Christmas 2025'],
    url: null,
    logo: null,
    tier: 'official',
    published: true,
  },
  {
    // Source: official "2025 Edition" partner poster on @poppinflea.
    slug: 'dream-maker',
    name: 'Dream Maker',
    role: 'Official Décor Partner',
    detail: 'Twinkling lights, candy-cane corners and immersive festive setups for the 2025 edition.',
    events: ['Poppin Christmas 2025'],
    url: null,
    logo: null,
    tier: 'official',
    published: true,
  },
  {
    slug: 'cafe-the-cartel',
    name: 'Cafe The Cartel',
    role: 'Venue partner',
    events: ['Poppin Christmas 2025'],
    url: null,
    logo: null,
    tier: 'venue',
    published: true,
  },
  {
    slug: 'cafe-buddys-espresso',
    name: 'Cafe Buddy’s Espresso',
    role: 'Venue partner',
    events: ['Poppin Christmas Flea 2024'],
    url: null,
    logo: null,
    tier: 'venue',
    published: true,
  },
  {
    slug: 'kiki-cafe',
    name: 'Kiki Cafe',
    role: 'Venue partner',
    events: ['Poppin Valentine Edition 2025'],
    url: null,
    logo: null,
    tier: 'venue',
    published: true,
  },
  {
    slug: 'indianoil',
    name: 'IndianOil XP95 · XtraGreen',
    role: 'Presenting partner',
    events: ['Garda Holi Festival', 'Garda Garba'],
    url: null,
    logo: null,
    tier: 'sponsor',
    published: true,
  },
  { slug: 'winsome', name: 'Winsome', role: 'Powered by', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'sponsor', published: true },
  { slug: 'rakesh-spices', name: 'Rakesh Spices & Food Products', role: 'Co-powered by', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'sponsor', published: true },
  { slug: 'kasturi-jewellers', name: 'Kasturi Jewellers', role: 'Co-powered by', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'sponsor', published: true },
  { slug: 'the-event-factory', name: 'The Event Factory', role: 'Co-organiser', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'premrajka-events', name: 'Premrajka Events', role: 'Co-organiser', events: ['Garda Garba'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'evanta', name: 'Evanta', role: 'Event associate', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'visit-bihar', name: 'Visit Bihar', role: 'Travel partner', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'empiro', name: 'Empiro', role: 'Technology partner', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'metagrafix', name: 'Metagrafix', role: 'Branding partner', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
  { slug: 'bookmyshow', name: 'BookMyShow', role: 'Ticketing partner', events: ['Garda Holi Festival'], url: null, logo: null, tier: 'collaborator', published: true },
];

export const PARTNER_TIERS = [
  { key: 'lead', label: 'Official partner' },
  { key: 'official', label: 'Poppin Christmas 2025 partners' },
  { key: 'venue', label: 'Venue partners' },
  { key: 'sponsor', label: 'Sponsors of Poppin co-productions' },
  { key: 'collaborator', label: 'Collaborators' },
];

export function publishedPartners() {
  return PARTNERS.filter((p) => p.published);
}
