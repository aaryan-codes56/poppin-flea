import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { publishedBrands, brandCategories, MIN_BRANDS_FOR_FILTERS } from '@/lib/data/brands';
import { publishedPartners, PARTNER_TIERS } from '@/lib/data/partners';
import { PAST_EVENTS } from '@/lib/data/events';
import { CONTACT } from '@/lib/config/site';
import { INSTAGRAM_POSTS } from '@/lib/data/instagram';
import InstagramCarousel from '../ui/InstagramCarousel';
import { TiltBox, CountUp } from '../ui/motion';
import s from './sections.module.css';

function initials(name) {
  // First letter of the first and last words: "House of Her Jewels" → "HJ".
  const words = name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ---------- Brands ----------
export function BrandCard({ brand, index = 0 }) {
  return (
    <Reveal as="li" delay={(index % 4) * 70} className={s.cell}>
      <TiltBox className={s.brandCard}>
      <div className={s.brandMark} data-tone={index % 4}>
        {brand.logo ? (
          <Image src={brand.logo} alt={`${brand.name} logo`} width={120} height={120} className={s.brandLogo} />
        ) : (
          <span aria-hidden="true">{initials(brand.name)}</span>
        )}
      </div>
      <div className={s.brandBody}>
        <p className={s.brandCat}>{brand.category || 'Stall at Poppin'}</p>
        <h3 className={s.brandName}>{brand.name}</h3>
        {brand.blurb && <p className={s.brandBlurb}>{brand.blurb}</p>}
        <p className={s.brandEvent}>Seen at {brand.event}</p>
      </div>
      {brand.instagram ? (
        <a
          className={s.brandLink}
          href={`https://www.instagram.com/${brand.instagram}/`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${brand.name} on Instagram (@${brand.instagram}, opens in a new tab)`}
        >
          <Icon name="instagram" size={18} /> @{brand.instagram}
        </a>
      ) : (
        <span className={s.brandLinkMuted}>Instagram coming soon</span>
      )}
      </TiltBox>
    </Reveal>
  );
}

export function BrandWall({ limit, showFilters = true, heading = true, tone = 'cream' }) {
  const brands = publishedBrands();
  const categories = brandCategories(brands);
  const [cat, setCat] = useState('All');
  const filtersOn = showFilters && brands.length >= MIN_BRANDS_FOR_FILTERS;
  const list = useMemo(() => {
    const l = cat === 'All' ? brands : brands.filter((b) => b.category === cat);
    return limit ? l.slice(0, limit) : l;
  }, [brands, cat, limit]);

  return (
    <section className={`section ${tone === 'cream' ? 'bg-cream' : 'bg-white'}`} aria-labelledby="brands-title">
      <div className="container">
        {heading && (
          <SectionHeading
            id="brands-title"
            eyebrow="Brands at Poppin"
            title={
              <>
                Made in Patna, <span className="display-italic">found at Poppin.</span>
              </>
            }
            intro="A few of the independent brands that have set up shop at previous Poppin markets. More names are being added as we verify our vendor archive."
          />
        )}
        {filtersOn && (
          <div className={s.filters} role="group" aria-label="Filter brands by category">
            {['All', ...categories].map((c) => (
              <button key={c} type="button" className={s.filter} aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <ul className={s.brandGrid}>
          {list.map((b, i) => (
            <BrandCard key={b.slug} brand={b} index={i} />
          ))}
          <Reveal as="li" className={`${s.brandCard} ${s.brandJoin}`} delay={list.length * 70}>
            <p className="eyebrow">Your brand here</p>
            <h3 className={s.brandName}>Join the Winter Carnival line-up</h3>
            <Link href="/book-a-stall" className="btn btn-burgundy btn-sm">
              Enquire for a stall <Icon name="arrowRight" />
            </Link>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}

// ---------- Stats strip (numbers come from the verified data files) ----------
export function StatsStrip() {
  const stats = [
    { to: 3, label: 'Festive days', sub: '23 · 24 · 25 December' },
    { to: PAST_EVENTS.length, label: 'Past events', sub: 'Markets & co-productions' },
    { to: publishedPartners().length, label: 'Partners & collaborators', sub: 'Who’ve backed Poppin' },
  ];
  return (
    <section className={s.stats} aria-label="Poppin in numbers">
      <div className={`container ${s.statsGrid}`}>
        {stats.map((x, i) => (
          <Reveal key={x.label} delay={i * 90} className={s.statItem}>
            <span className={s.statNum}>
              <CountUp to={x.to} />
            </span>
            <span className={s.statLabel}>{x.label}</span>
            <span className={s.statSub}>{x.sub}</span>
          </Reveal>
        ))}
        <Reveal delay={280} className={`${s.statItem} ${s.statCta}`}>
          <span className={s.statLabel}>Limited stalls</span>
          <Link href="/book-a-stall" className="btn btn-primary btn-sm">
            Reserve yours <Icon name="arrowRight" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Partners ----------
export function PartnerWall({ compact = false }) {
  const partners = publishedPartners();
  const tiers = PARTNER_TIERS.map((t) => ({ ...t, items: partners.filter((p) => p.tier === t.key) })).filter((t) => t.items.length);
  const shown = compact ? tiers.filter((t) => ['lead', 'official', 'venue'].includes(t.key)) : tiers;

  return (
    <section className="section bg-white" aria-labelledby="partners-title">
      <div className="container">
        <SectionHeading
          id="partners-title"
          eyebrow="Past partners"
          title={
            <>
              In good <span className="display-italic">company.</span>
            </>
          }
          intro="The organisers, venues and sponsors who have stood behind Poppin and the events we’ve co-produced."
        />
        <div className={s.partnerMarquee} aria-hidden="true">
          <div className={s.partnerMarqueeTrack}>
            {[...partners, ...partners].map((p, i) => (
              <span key={`${p.slug}-${i}`}>
                {p.name}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
        <div className={s.partnerTiers}>
          {shown.map((tier) => (
            <Reveal key={tier.key} className={s.partnerTier}>
              <h3 className={s.partnerTierTitle}>{tier.label}</h3>
              <ul className={`${s.partnerGrid} ${tier.key === 'lead' || tier.key === 'official' ? s.partnerGridFeature : ''}`}>
                {tier.items.map((p) => {
                  const body = (
                    <>
                      {p.logo ? (
                        <Image src={p.logo} alt={`${p.name} logo`} width={160} height={80} className={s.partnerLogo} />
                      ) : (
                        <span className={s.partnerName}>{p.name}</span>
                      )}
                      <span className={s.partnerRole}>{p.role}</span>
                      {p.detail && (tier.key === 'lead' || tier.key === 'official') && <span className={s.partnerDetail}>{p.detail}</span>}
                      <span className={s.partnerEvents}>{p.events.join(' · ')}</span>
                    </>
                  );
                  return (
                    <li key={p.slug} className={s.partner}>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className={s.partnerInner}>
                          {body}
                          <Icon name="arrowUpRight" size={16} className={s.partnerArrow} />
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <div className={s.partnerInner}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
        {compact && (
          <Reveal>
            <Link href="/about#partners" className="link">
              See all partners and collaborators
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ---------- Past events ----------
export function EventCard({ event, index = 0, large = false }) {
  return (
    <Reveal as="li" delay={(index % 3) * 80} className={`${s.cell} ${large ? s.eventLarge : ''}`}>
      <TiltBox as="article" max={4} className={s.eventCard}>
      <div className={`${s.eventMedia} ${event.imageKind === 'poster' ? s.eventPoster : ''}`}>
        <Image src={event.image} alt={event.imageAlt} fill sizes={large ? '(max-width: 900px) 92vw, 55vw' : '(max-width: 900px) 92vw, 30vw'} className={s.cover} />
        <span className={s.eventYear}>{event.year}</span>
      </div>
      <div className={s.eventBody}>
        <h3>{event.name}</h3>
        <p className={s.eventMeta}>
          <Icon name="calendar" size={16} /> {event.dates}
          {event.time ? ` · ${event.time}` : ''}
        </p>
        <p className={s.eventMeta}>
          <Icon name="pin" size={16} /> {event.venue}
        </p>
        <p className={s.eventSummary}>{event.summary}</p>
        <ul className={s.tags}>
          {event.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        {event.press && (
          <a href={event.press.url} target="_blank" rel="noopener noreferrer" className={`link ${s.press}`}>
            In the press: {event.press.outlet} <Icon name="external" size={14} />
          </a>
        )}
        {event.yearNote && <p className={s.eventNote}>{event.yearNote}</p>}
      </div>
      </TiltBox>
    </Reveal>
  );
}

export function PastEventsPreview() {
  const [first, ...rest] = PAST_EVENTS;
  return (
    <section className="section bg-wine tone-dark" aria-labelledby="past-title">
      <div className="container">
        <div className={s.rowHead}>
          <SectionHeading
            id="past-title"
            eyebrow="Previous events"
            title={
              <>
                Where Poppin has <span className="display-italic">popped up.</span>
              </>
            }
          />
          <Link href="/past-events" className="btn btn-outline">
            Full event archive <Icon name="arrowRight" />
          </Link>
        </div>
        <ul className={s.eventGrid}>
          <EventCard event={first} large />
          {rest.slice(0, 2).map((e, i) => (
            <EventCard key={e.slug} event={e} index={i + 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------- Instagram ----------
export function InstagramSection({ eyebrow, title, intro }) {
  return (
    <section className="section bg-cream-deep" aria-labelledby="ig-title">
      <div className="container">
        <div className={s.rowHead}>
          <SectionHeading
            id="ig-title"
            eyebrow={eyebrow || CONTACT.instagramHandle}
            title={
              title || (
                <>
                  Follow the <span className="display-italic">Poppin experience.</span>
                </>
              )
            }
            intro={intro || 'Reels and posts from Poppin Christmas 2025, straight from Instagram. Swipe through, then follow for the venue reveal.'}
          />
        </div>
        <InstagramCarousel posts={INSTAGRAM_POSTS} />
        <Reveal className={s.igFollow}>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-burgundy">
            <Icon name="instagram" /> Follow {CONTACT.instagramHandle}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
