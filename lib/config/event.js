// Poppin Winter Carnival 2026 — single source of truth.
// Every value here comes from the official announcement. Anything not yet
// announced is `null` and the UI shows "To be announced".

export const WINTER_CARNIVAL = {
  slug: 'winter-carnival',
  name: 'Poppin Winter Carnival',
  edition: '2026',
  fullName: 'Poppin Winter Carnival 2026',
  headline: 'Patna’s biggest flea market event!',
  heroHeadline: 'Patna, get ready for the Winter Carnival!',
  heroSupport:
    'Three days of shopping, food, lifestyle brands, unique finds and unforgettable festive vibes.',
  returnLine: 'Poppin’ is back with a festive twist!',
  description:
    'This Christmas & New Year week, experience Patna’s biggest flea market event with shopping, food, lifestyle brands, unique finds and a whole lot of festive vibes!',

  // Dates (Asia/Kolkata). The countdown runs to the start of 23 December.
  timezone: 'Asia/Kolkata',
  startsAt: '2026-12-23T00:00:00+05:30',
  endsAt: '2026-12-26T00:00:00+05:30', // end of 25 December
  startDate: '2026-12-23',
  endDate: '2026-12-25',
  days: [
    { iso: '2026-12-23', day: '23', weekday: 'Wednesday', short: 'Wed' },
    { iso: '2026-12-24', day: '24', weekday: 'Thursday', short: 'Thu' },
    { iso: '2026-12-25', day: '25', weekday: 'Friday', short: 'Fri' },
  ],
  dateLabel: '23–25 December 2026',
  dateLabelLong: '23, 24 and 25 December 2026',

  city: 'Patna',
  region: 'Bihar',
  locationLabel: 'Patna, Bihar',

  // Not announced yet. Set these once the venue is confirmed.
  venue: null, // e.g. { name: '', address: '', mapUrl: '' }
  timings: null, // e.g. '3 PM onwards'

  stalls: {
    preBookingOpen: true,
    limited: true,
    callout: 'Calling all businesses, brands & entrepreneurs!',
    pitch:
      'Want to showcase your brand, connect with new customers and be part of Patna’s most exciting carnival? This is your chance!',
    // Business details still to be confirmed by the organisers. Leave `null`
    // until confirmed; the site shows "Shared by the team on enquiry".
    price: null,
    dimensions: null,
    inclusions: null,
    power: null,
    paymentTerms: null,
    refundPolicy: null,
  },
};

export function isVenueAnnounced() {
  return Boolean(WINTER_CARNIVAL.venue && WINTER_CARNIVAL.venue.name);
}

export const VENUE_TBA_LABEL = 'Venue to be announced';

// Things visitors can expect. Only positioning from the official announcement.
export const EXPECTATIONS = [
  { key: 'brands', title: 'Discover unique brands', body: 'Independent labels and home-grown businesses from Patna and beyond, all in one place.' },
  { key: 'fashion', title: 'Fashion & lifestyle', body: 'Clothing, accessories, jewellery and lifestyle finds you won’t see on every high street.' },
  { key: 'local', title: 'Shop independent', body: 'Every purchase goes straight to a local maker, founder or small business.' },
  { key: 'food', title: 'Food & refreshments', body: 'Festive bites and drinks to keep you going between stalls.' },
  { key: 'handmade', title: 'Handmade finds', body: 'Crafted, small-batch and one-of-a-kind pieces, perfect for Christmas gifting.' },
  { key: 'festive', title: 'Festive vibes', body: 'Christmas and New Year week in Patna, with a whole lot of festive vibes.' },
];

// Categories shown on the vendor enquiry form and the carnival page.
export const VENDOR_CATEGORIES = [
  'Fashion & clothing',
  'Jewellery & accessories',
  'Beauty & skincare',
  'Food & beverages',
  'Bakery & desserts',
  'Home decor & fragrance',
  'Art & handmade',
  'Lifestyle & gifting',
  'Kids & toys',
  'Services & experiences',
  'Other',
];

export const STALL_PREFERENCES = [
  'Standard stall',
  'Food stall',
  'Pop-up / display table',
  'Not sure yet — please advise',
];
