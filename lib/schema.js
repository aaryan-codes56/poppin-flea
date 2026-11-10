// Structured data (schema.org). Built only from verified config.
import { SITE, CONTACT } from './config/site';
import { WINTER_CARNIVAL as E, isVenueAnnounced } from './config/event';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/brand/poppin-logo.png`,
    sameAs: [CONTACT.instagramUrl],
    contactPoint: [{ '@type': 'ContactPoint', telephone: CONTACT.phoneE164, contactType: 'customer service', areaServed: 'IN' }],
  };
}

export function eventSchema() {
  const venue = isVenueAnnounced() ? E.venue : null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: E.fullName,
    description: E.description,
    startDate: E.startDate,
    endDate: E.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [`${SITE.url}/og/winter-carnival-2026.jpg`],
    url: `${SITE.url}/winter-carnival`,
    location: {
      '@type': 'Place',
      name: venue ? venue.name : 'Venue to be announced, Patna',
      address: {
        '@type': 'PostalAddress',
        ...(venue?.address ? { streetAddress: venue.address } : {}),
        addressLocality: 'Patna',
        addressRegion: 'Bihar',
        addressCountry: 'IN',
      },
    },
    organizer: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function graph(...items) {
  return { '@context': 'https://schema.org', '@graph': items.map(({ '@context': _c, ...rest }) => rest) };
}
