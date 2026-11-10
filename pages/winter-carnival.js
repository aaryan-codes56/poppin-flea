import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import Countdown from '@/components/ui/Countdown';
import SectionHeading from '@/components/ui/SectionHeading';
import ContactButtons from '@/components/ui/ContactButtons';
import ShareButtons from '@/components/ui/ShareButtons';
import Faq from '@/components/ui/Faq';
import StringLights from '@/components/ui/StringLights';
import { EventFacts, Stamp } from '@/components/sections/Hero';
import { WhatToExpect, Announcements } from '@/components/sections/EventSections';
import { BrandWall } from '@/components/sections/Showcase';
import Newsletter from '@/components/forms/Newsletter';
import { WINTER_CARNIVAL as E, VENDOR_CATEGORIES, VENUE_TBA_LABEL } from '@/lib/config/event';
import { CONTACT } from '@/lib/config/site';
import { FAQS } from '@/lib/data/faqs';
import { eventSchema, faqSchema, graph } from '@/lib/schema';
import { publishedAnnouncements } from '@/lib/server/announcements';
import { Snow, SplitWords } from '@/components/ui/motion';
import p from '@/styles/pages.module.css';

const PENDING = 'Shared by the team when you enquire';

export default function WinterCarnival({ announcements }) {
  const stallInfo = [
    ['Booking status', 'Pre-bookings open'],
    ['Availability', 'Limited stalls'],
    ['Dates', E.dateLabelLong],
    ['Location', `${E.locationLabel} · ${VENUE_TBA_LABEL}`],
    ['Stall price', E.stalls.price || PENDING],
    ['Stall size & inclusions', E.stalls.dimensions || E.stalls.inclusions || PENDING],
    ['Power & furniture', E.stalls.power || PENDING],
    ['Payment & refunds', E.stalls.paymentTerms || PENDING],
  ];

  return (
    <Layout
      overlayNav
      seo={{
        title: `${E.fullName} — Stalls open · 23–25 Dec, Patna`,
        description: `${E.headline} ${E.description} Venue to be announced. Book a stall: call ${CONTACT.phone}.`,
        jsonLd: graph(eventSchema(), faqSchema(FAQS)),
      }}
    >
      {/* Full-screen hero */}
      <section className={`${p.wcHero} tone-dark`} aria-labelledby="wc-title">
        <Image src="/christmas-flea.jpg" alt="" fill preload loading="eager" sizes="100vw" className={p.wcHeroBg} />
        <div className={p.wcHeroShade} aria-hidden="true" />
        <StringLights className={p.wcLights} count={26} />
        <Snow count={40} />
        <div className={`container ${p.wcHeroInner}`}>
          <p className="eyebrow">{E.returnLine}</p>
          <h1 id="wc-title" className={p.wcTitle}>
            <SplitWords delay={120} step={110}>
              Poppin <span className="display-italic">Winter Carnival</span>
            </SplitWords>
            <span className={p.wcYear}>2026</span>
          </h1>
          <p className={p.wcHeadline}>{E.headline}</p>
          <EventFacts />
          <div className="btn-row">
            <Link href="/book-a-stall" className="btn btn-primary btn-lg">
              Book a stall <Icon name="arrowRight" />
            </Link>
            <a href="#details" className="btn btn-outline btn-lg">
              Event details
            </a>
          </div>
          <div className={p.wcCountdown}>
            <Countdown />
          </div>
        </div>
      </section>

      <Announcements items={announcements} />

      {/* Description + facts */}
      <section className="section bg-cream" id="details" aria-labelledby="about-wc">
        <div className={`container ${p.twoCol}`}>
          <div>
            <SectionHeading
              id="about-wc"
              eyebrow="About the event"
              title={
                <>
                  Three days. Endless finds. <span className="display-italic">Unforgettable vibes.</span>
                </>
              }
            />
            <Reveal className={p.prose}>
              <p className={p.bigQuote}>{E.description}</p>
              <p>
                Expect shopping from independent businesses, fashion and lifestyle labels, handmade products, food and refreshments and plenty of
                unique finds, all wrapped in Christmas and New Year atmosphere. More details, including the venue and daily timings, will be
                announced officially.
              </p>
            </Reveal>
            <Reveal className={p.shareBox}>
              <p className={p.shareLabel}>Tell your friends</p>
              <ShareButtons text={`${E.fullName} — ${E.headline} ${E.dateLabel}, ${E.locationLabel}.`} />
            </Reveal>
          </div>
          <Reveal as="aside" className={p.factCard} delay={120} aria-label="Event at a glance">
            <Stamp text="Patna’s biggest flea market event · " />
            <h2 className={p.factTitle}>At a glance</h2>
            <dl className={p.factList}>
              <div>
                <dt>Dates</dt>
                <dd>{E.dateLabelLong}</dd>
              </div>
              <div>
                <dt>Days</dt>
                <dd>{E.days.map((d) => d.weekday).join(', ')}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{E.locationLabel}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>
                  <span className="chip chip-tba">{VENUE_TBA_LABEL}</span>
                </dd>
              </div>
              <div>
                <dt>Timings</dt>
                <dd>{E.timings || 'To be announced'}</dd>
              </div>
              <div>
                <dt>Stalls</dt>
                <dd>Pre-bookings open · limited</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <WhatToExpect tone="dark" />

      {/* Vendor categories */}
      <section className="section bg-white" aria-labelledby="cats-title">
        <div className="container">
          <SectionHeading
            id="cats-title"
            eyebrow="Who can apply"
            title={
              <>
                Calling all businesses, brands <span className="display-italic">&amp; entrepreneurs!</span>
              </>
            }
            intro={E.stalls.pitch}
          />
          <Reveal as="ul" className={p.catCloud}>
            {VENDOR_CATEGORIES.filter((c) => c !== 'Other').map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li className={p.catMore}>…and more</li>
          </Reveal>
        </div>
      </section>

      {/* Stall booking info */}
      <section className="section bg-forest tone-dark" aria-labelledby="stall-info" id="stalls">
        <div className={`container ${p.twoCol}`}>
          <div>
            <SectionHeading
              id="stall-info"
              eyebrow="Stall booking"
              title={
                <>
                  Stall pre-bookings are <span className="display-italic">now open!</span>
                </>
              }
              intro="Limited stalls available. Send an enquiry, call or WhatsApp to reserve your spot. Every application is reviewed and confirmed directly by the Poppin team."
            />
            <Reveal>
              <ContactButtons size="lg" location="carnival_stalls" />
            </Reveal>
            <Reveal as="ol" className={p.steps}>
              <li>
                <span>
                  <strong>Enquire</strong>: online form, call or WhatsApp {CONTACT.phone}.
                </span>
              </li>
              <li>
                <span>
                  <strong>Hear back</strong>: the team contacts you with availability and stall details.
                </span>
              </li>
              <li>
                <span>
                  <strong>Confirm</strong>: your stall is booked once the Poppin team confirms it with you.
                </span>
              </li>
            </Reveal>
          </div>
          <Reveal className={p.infoTable} delay={100}>
            <table>
              <caption className="visually-hidden">Stall booking details</caption>
              <tbody>
                {stallInfo.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td className={v === PENDING ? p.pending : ''}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={p.tableNote}>
              Pricing, sizes and inclusions are being finalised and will be published here once confirmed.
            </p>
          </Reveal>
        </div>
      </section>

      <BrandWall limit={8} showFilters={false} />

      <section className="section bg-cream-deep" aria-labelledby="wc-faq" id="faq">
        <div className="container-narrow">
          <SectionHeading id="wc-faq" eyebrow="FAQ" title="Questions, answered" align="center" />
          <Faq items={FAQS} />
        </div>
      </section>

      <section className="section bg-wine tone-dark" aria-labelledby="wc-contact">
        <div className={`container ${p.contactBand}`}>
          <SectionHeading
            id="wc-contact"
            eyebrow="Contact the organisers"
            title={
              <>
                Reserve your spot: <a href={`tel:${CONTACT.phoneE164}`} className={p.bigPhone}>{CONTACT.phone}</a>
              </>
            }
            intro={`Call or WhatsApp for stall bookings, or DM ${CONTACT.instagramHandle} on Instagram.`}
          />
          <ContactButtons location="carnival_contact" />
        </div>
      </section>

      <Newsletter />
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { announcements: await publishedAnnouncements(3) }, revalidate: 120 };
}
