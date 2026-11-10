// Brand-wide facts used across the site. Change contact details here only.

export const SITE = {
  name: 'Poppin',
  legalName: 'Poppin Fun & Flea',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.poppinflea.in').replace(/\/$/, ''),
  tagline: 'Patna’s community flea market & lifestyle events',
  description:
    'Poppin brings Patna’s independent brands, home-grown businesses and makers together for flea markets and festive events.',
  locale: 'en_IN',
  city: 'Patna',
  region: 'Bihar',
  country: 'IN',
  organiser: { name: 'Garda Patna', instagram: 'https://www.instagram.com/gardapatna/' },
};

export const CONTACT = {
  phone: '8409455524',
  phoneDisplay: '+91 84094 55524',
  phoneE164: '+918409455524',
  whatsappNumber: '918409455524',
  instagramHandle: '@poppinflea',
  instagramUrl: 'https://www.instagram.com/poppinflea/',
};

export function whatsappLink(message) {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${CONTACT.whatsappNumber}${text}`;
}

export const WHATSAPP_MESSAGES = {
  stall:
    'Hi Poppin! I’d like to book a stall at Poppin Winter Carnival 2026 (23–25 Dec, Patna).\n\nBrand name:\nCategory:\nInstagram:',
  general: 'Hi Poppin! I have a question about Poppin Winter Carnival 2026.',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/winter-carnival', label: 'Winter Carnival' },
  { href: '/brands', label: 'Brands' },
  { href: '/past-events', label: 'Past Events' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];
