import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import Icon from '@/components/ui/Icon';
import { PartnerWall } from '@/components/sections/Showcase';
import { WhatToExpect } from '@/components/sections/EventSections';
import { PAST_EVENTS } from '@/lib/data/events';
import { SITE } from '@/lib/config/site';
import { organizationSchema } from '@/lib/schema';
import p from '@/styles/pages.module.css';

const PILLARS = [
  { icon: 'store', title: 'Independent first', body: 'Poppin is built for home-grown businesses, small labels and first-time founders, not big-box retail.' },
  { icon: 'users', title: 'Community-driven', body: 'Every market is a meeting place: makers meet customers, neighbours meet neighbours, and new brands find their people.' },
  { icon: 'sparkle', title: 'Always an occasion', body: 'Each edition is tied to a celebration — Christmas, Valentine’s, Holi, Navratri — so shopping feels like a festival.' },
];

export default function About() {
  return (
    <Layout seo={{ title: 'About Poppin', description: SITE.description, jsonLd: organizationSchema() }}>
      <PageHeader
        eyebrow="About Poppin"
        title={
          <>
            Part market, <span className="display-italic">part celebration.</span>
          </>
        }
        intro="Poppin — Poppin’ Fun & Flea — is a community-driven flea market and lifestyle event platform from Patna, Bihar."
      />

      <section className="section bg-cream">
        <div className={`container ${p.twoCol}`}>
          <div>
            <SectionHeading eyebrow="Our story" title="Bringing Patna’s makers and shoppers together." />
            <Reveal className={p.prose}>
              <p>
                Poppin brings independent businesses, brands and entrepreneurs together with the customers who love discovering them. Our
                markets mix shopping, food and festive atmosphere, so a stall at Poppin is as much about meeting people as it is about selling.
              </p>
              <p>
                Poppin is presented together with our official partner <strong>Garda Patna</strong>, a unit of Garda Media Pvt Ltd. Along the way
                we’ve worked with venue partners like Cafe Buddy’s Espresso, Kiki Cafe and Cafe The Cartel, and co-produced bigger celebrations
                such as the Garda Holi Festival and Garda Garba.
              </p>
              <p>
                Our December 2025 edition welcomed Satvika Celebration as Official Celebration Partner and Dream Maker as Official Décor Partner.
                In December 2026 we’re going bigger with the Poppin Winter Carnival.
              </p>
            </Reveal>
            <Reveal className={p.aboutCtas}>
              <Link href="/winter-carnival" className="btn btn-burgundy">
                Winter Carnival 2026 <Icon name="arrowRight" />
              </Link>
              <Link href="/past-events" className="btn btn-outline">
                {PAST_EVENTS.length} past events
              </Link>
            </Reveal>
          </div>
          <Reveal className={p.aboutImage} delay={120}>
            <Image src="/christmas-flea-2024.jpg" alt="Visitors at a Poppin Christmas market beside a glowing snowman" fill sizes="(max-width: 900px) 92vw, 45vw" className={p.cover} />
          </Reveal>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="pillars">
        <div className="container">
          <SectionHeading id="pillars" eyebrow="What we stand for" title="Three things every Poppin gets right." />
          <ul className={p.pillars}>
            {PILLARS.map((x, i) => (
              <Reveal as="li" key={x.title} delay={i * 90} className={p.pillar}>
                <Icon name={x.icon} size={28} />
                <h3>{x.title}</h3>
                <p className="muted">{x.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <div id="partners">
        <PartnerWall />
      </div>
      <WhatToExpect tone="dark" />
    </Layout>
  );
}
