import Link from 'next/link';
import Image from 'next/image';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import ContactButtons from '../ui/ContactButtons';
import { WINTER_CARNIVAL as E, EXPECTATIONS, VENUE_TBA_LABEL } from '@/lib/config/event';
import { CONTACT } from '@/lib/config/site';
import { ANNOUNCEMENT_TYPES } from '@/lib/config/crm';
import { TiltBox } from '../ui/motion';
import s from './sections.module.css';

const EXPECT_ICONS = { brands: 'star', fashion: 'shirt', local: 'store', food: 'cup', handmade: 'hand', festive: 'gift' };

// ---------- About Poppin ----------
export function AboutPoppin() {
  return (
    <section className="section bg-cream" aria-labelledby="about-title">
      <div className={`container ${s.split}`}>
        <div>
          <SectionHeading
            id="about-title"
            eyebrow="About Poppin"
            title={
              <>
                Patna’s home for <span className="display-italic">independent</span> brands, makers and good times.
              </>
            }
          />
          <Reveal className={s.prose}>
            <p>
              Poppin — Poppin’ Fun &amp; Flea — is a community-driven flea market and lifestyle event platform from Patna. We bring
              independent businesses, home-grown brands and first-time entrepreneurs face to face with the people who love discovering
              them.
            </p>
            <p>
              From our Christmas market at Cafe Buddy’s Espresso in 2024 to Christmas 2025 at Cafe The Cartel, Poppin has popped up across
              the city for Christmas, Valentine’s, Holi and Navratri, presented together with our official partner Garda Patna. Every
              edition is part market, part celebration.
            </p>
          </Reveal>
          <Reveal className={s.aboutLinks}>
            <Link href="/about" className="link">
              Our story
            </Link>
            <Link href="/past-events" className="link">
              Past events
            </Link>
          </Reveal>
        </div>
        <Reveal className={s.collage} delay={120}>
          <div className={s.collageMain}>
            <Image
              src="/flea-stalls.jpg"
              alt="Vendors from Sweet Fairy Patna, Haut de Scents and Desi Mantra at their stalls"
              fill
              sizes="(max-width: 900px) 92vw, 46vw"
              className={s.cover}
            />
          </div>
          <div className={s.collageSide}>
            <Image
              src="/christmas-flea-2024.jpg"
              alt="Visitors browsing beside a glowing snowman and the Poppin sign"
              fill
              sizes="(max-width: 900px) 45vw, 22vw"
              className={s.cover}
            />
          </div>
          <p className={s.collageNote}>Real stalls, real makers — Poppin Christmas market</p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- About the Winter Carnival ----------
export function CarnivalAbout() {
  return (
    <section className="section bg-forest tone-dark" aria-labelledby="carnival-title" id="carnival">
      <div className="container">
        <SectionHeading
          id="carnival-title"
          eyebrow={`${E.fullName} · ${E.locationLabel}`}
          title={
            <>
              Three days. Endless finds. <span className="display-italic">Unforgettable vibes.</span>
            </>
          }
          intro="Poppin is back with a festive twist! Experience Patna’s biggest flea market event with shopping, food, lifestyle brands, unique finds and a whole lot of festive vibes."
        />
        <ol className={s.days}>
          {E.days.map((d, i) => (
            <Reveal as="li" key={d.iso} delay={i * 90} className={s.day}>
              <span className={s.dayLabel}>Day {i + 1}</span>
              <span className={s.dayNum}>{d.day}</span>
              <span className={s.dayMeta}>
                December · {d.weekday}
                {d.day === '24' && <em> · Christmas Eve</em>}
                {d.day === '25' && <em> · Christmas Day</em>}
              </span>
            </Reveal>
          ))}
        </ol>
        <Reveal className={s.carnivalFoot}>
          <p className="muted">
            <Icon name="pin" size={18} /> {E.locationLabel} · <span className="chip chip-tba">{VENUE_TBA_LABEL}</span> · Daily timings will be announced
            officially.
          </p>
          <Link href="/winter-carnival" className="btn btn-outline">
            Everything about the carnival <Icon name="arrowRight" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- What to expect ----------
export function WhatToExpect({ tone = 'light' }) {
  return (
    <section className={`section ${tone === 'light' ? 'bg-cream-deep' : 'bg-wine tone-dark'}`} aria-labelledby="expect-title">
      <div className="container">
        <SectionHeading id="expect-title" eyebrow="What to expect" title="Your winter shopping trip, sorted." align="center" />
        <ul className={s.expectGrid}>
          {EXPECTATIONS.map((x, i) => (
            <Reveal as="li" key={x.key} delay={(i % 3) * 80} className={s.cell}>
              <TiltBox className={s.expectCard}>
                <span className={s.expectIcon}>
                  <Icon name={EXPECT_ICONS[x.key]} size={26} />
                </span>
                <h3>{x.title}</h3>
                <p>{x.body}</p>
              </TiltBox>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- Stall booking CTA ----------
export function StallSpotlight() {
  const points = [
    'Stall pre-bookings are now open',
    'Limited stalls available',
    '23, 24 & 25 December',
    'Venue to be announced',
  ];
  return (
    <section className={`section ${s.spotlight} tone-dark`} aria-labelledby="spotlight-title">
      <div className={s.spotlightBeam} aria-hidden="true" />
      <div className={`container ${s.spotlightGrid}`}>
        <div>
          <SectionHeading
            id="spotlight-title"
            eyebrow={E.stalls.callout}
            title={
              <>
                Your brand deserves the <span className="display-italic">spotlight.</span>
              </>
            }
            intro="Calling all businesses, brands and entrepreneurs! Showcase your brand, connect with new customers and be part of Patna’s most exciting carnival."
          />
          <Reveal>
            <ContactButtons size="lg" location="home_spotlight" />
          </Reveal>
        </div>
        <Reveal as="ul" className={s.ticket} delay={120}>
          {points.map((p) => (
            <li key={p}>
              <Icon name="check" size={20} /> {p}
            </li>
          ))}
          <li className={s.ticketPhone}>
            <span>Call to reserve your spot</span>
            <a href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phone}</a>
          </li>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Announcements ----------
export function Announcements({ items }) {
  if (!items || !items.length) return null;
  const label = (t) => ANNOUNCEMENT_TYPES.find((x) => x.key === t)?.label || 'Update';
  return (
    <section className={`section ${s.updates}`} aria-labelledby="updates-title">
      <div className="container">
        <SectionHeading id="updates-title" eyebrow="Latest updates" title="News from the carnival" />
        <ul className={s.updateList}>
          {items.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 70} className={`${s.updateCard} ${a.pinned ? s.updatePinned : ''}`}>
              <p className={s.updateMeta}>
                <Icon name="megaphone" size={16} /> {label(a.type)}
                <time dateTime={a.createdAt}>
                  {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                </time>
              </p>
              <h3>{a.title}</h3>
              {a.body && <p className="muted">{a.body}</p>}
              {a.linkUrl && (
                <a
                  href={a.linkUrl}
                  className="link"
                  {...(a.linkUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {a.linkLabel || 'Learn more'}
                </a>
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
