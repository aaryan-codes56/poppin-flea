import { useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '../ui/Icon';
import Countdown from '../ui/Countdown';
import StringLights from '../ui/StringLights';
import { WINTER_CARNIVAL as E, VENUE_TBA_LABEL, isVenueAnnounced } from '@/lib/config/event';
import { track } from '@/lib/analytics';
import { Snow, SplitWords, useParallax } from '../ui/motion';
import s from './sections.module.css';

export function EventFacts({ tone = 'dark' }) {
  return (
    <ul className={`${s.facts} ${tone === 'light' ? s.factsLight : ''}`}>
      <li>
        <Icon name="calendar" size={20} />
        <span>
          <strong>{E.dateLabel}</strong>
        </span>
      </li>
      <li>
        <Icon name="pin" size={20} />
        <span>
          <strong>{E.locationLabel}</strong>
        </span>
      </li>
      <li>
        {isVenueAnnounced() ? (
          <span>
            <strong>{E.venue.name}</strong>
          </span>
        ) : (
          <span className="chip chip-tba">
            <Icon name="sparkle" size={14} /> {VENUE_TBA_LABEL}
          </span>
        )}
      </li>
    </ul>
  );
}

export function Stamp({ text = 'Christmas & New Year week · Patna · 2026 · ' }) {
  const id = `stamp-${useId().replace(/:/g, '')}`;
  return (
    <svg className={s.stamp} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="var(--pop-yellow)" />
      <text fontSize="10.4" fontWeight="800" letterSpacing="2.2" fill="var(--burgundy-900)">
        <textPath href={`#${id}`} textLength="289" lengthAdjust="spacing">{text.toUpperCase()}</textPath>
      </text>
      <g transform="translate(60 60)" fill="var(--burgundy-900)">
        <path d="M0-16c1.2 9 4 12 13 13.5C4-1 1.2 2 0 11-1.2 2-4-1-13-2.5-4-4-1.2-7 0-16Z" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const visual = useParallax();
  return (
    <section className={`${s.hero} tone-dark`} aria-labelledby="hero-title">
      <StringLights className={s.heroLights} count={24} />
      <div className={s.heroGlow} aria-hidden="true" />
      <Snow />
      <div className={`container ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <p className={`${s.heroIn} chip ${s.heroChip}`} style={{ '--d': '0ms' }}>
            <span className="live-dot" aria-hidden="true" /> Stall pre-bookings are now open
          </p>
          <p className={`eyebrow ${s.heroIn}`} style={{ '--d': '80ms' }}>
            {E.fullName}
          </p>
          <h1 id="hero-title" className={s.heroTitle}>
            <SplitWords delay={160}>
              Patna, get ready for the <span className="display-italic">Winter Carnival!</span>
            </SplitWords>
          </h1>
          <p className={`${s.heroLead} ${s.heroIn}`} style={{ '--d': '220ms' }}>
            {E.heroSupport}
          </p>
          <div className={s.heroIn} style={{ '--d': '280ms' }}>
            <EventFacts />
          </div>
          <div className={`btn-row ${s.heroIn}`} style={{ '--d': '340ms' }}>
            <Link href="/book-a-stall" className="btn btn-primary btn-lg" onClick={() => track('cta_click', { cta: 'book_stall', location: 'hero' })}>
              Book a stall <Icon name="arrowRight" />
            </Link>
            <Link href="/winter-carnival" className="btn btn-outline btn-lg" onClick={() => track('cta_click', { cta: 'explore_carnival', location: 'hero' })}>
              Explore the carnival
            </Link>
          </div>
        </div>

        <div ref={visual} className={`${s.heroVisual} ${s.heroIn}`} style={{ '--d': '200ms' }}>
          <div className={s.heroArch}>
            <Image
              src="/christmas-flea.jpg"
              alt="Poppin’s Christmas installation with a red bow, silver stars, a reindeer, a snowman and a lit Christmas tree"
              fill
              preload
              loading="eager"
              sizes="(max-width: 1023px) 80vw, 40vw"
              className={s.cover}
            />
          </div>
          <div className={s.heroThumb}>
            <Image src="/flea-stalls.jpg" alt="Vendors at their stalls at a previous Poppin market" fill sizes="200px" className={s.cover} />
          </div>
          <div className={s.heroDate} aria-hidden="true">
            <span>Dec</span>
            <strong>23–25</strong>
            <span>2026</span>
          </div>
          <Stamp />
        </div>
      </div>

      <div className={`container ${s.heroBottom}`}>
        <Countdown />
        <p className={s.heroTagline}>
          <span className="display-italic">“{E.headline}”</span>
        </p>
      </div>
    </section>
  );
}

const RIBBON = ['Shopping', 'Food', 'Lifestyle brands', 'Unique finds', 'Independent businesses', 'Festive vibes'];

export function Ribbon() {
  const row = (
    <>
      {RIBBON.map((w) => (
        <span key={w} className={s.ribbonItem}>
          {w}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2c.6 5 2.4 7.4 8 8-5.6.6-7.4 3-8 8-.6-5-2.4-7.4-8-8 5.6-.6 7.4-3 8-8Z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </>
  );
  return (
    <div className={s.ribbon}>
      <p className="visually-hidden">{RIBBON.join(', ')}</p>
      <div className={s.ribbonTrack} aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}
