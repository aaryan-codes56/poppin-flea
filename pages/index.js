import Layout from '@/components/layout/Layout';
import Hero, { Ribbon } from '@/components/sections/Hero';
import { AboutPoppin, CarnivalAbout, WhatToExpect, StallSpotlight, Announcements } from '@/components/sections/EventSections';
import { BrandWall, PartnerWall, PastEventsPreview, InstagramSection, StatsStrip } from '@/components/sections/Showcase';
import SectionHeading from '@/components/ui/SectionHeading';
import Gallery from '@/components/ui/Gallery';
import Faq from '@/components/ui/Faq';
import Newsletter from '@/components/forms/Newsletter';
import { GALLERY } from '@/lib/data/gallery';
import { FAQS } from '@/lib/data/faqs';
import { WINTER_CARNIVAL as E } from '@/lib/config/event';
import { eventSchema, organizationSchema, faqSchema, graph } from '@/lib/schema';
import { publishedAnnouncements } from '@/lib/server/announcements';

export default function Home({ announcements }) {
  const homeFaqs = FAQS.slice(0, 10);
  return (
    <Layout
      overlayNav
      seo={{
        title: `${E.fullName} — 23–25 December, Patna`,
        description: `${E.description} Stall pre-bookings are open — limited stalls. Venue to be announced.`,
        jsonLd: graph(organizationSchema(), eventSchema(), faqSchema(homeFaqs)),
        path: '/',
      }}
    >
      <Hero />
      <Ribbon />
      <StatsStrip />
      <Announcements items={announcements} />
      <AboutPoppin />
      <CarnivalAbout />
      <StallSpotlight />
      <BrandWall limit={8} showFilters={false} />
      <PartnerWall compact />
      <PastEventsPreview />
      <WhatToExpect />

      <section className="section bg-cream" aria-labelledby="gallery-title">
        <div className="container">
          <SectionHeading
            id="gallery-title"
            eyebrow="Event gallery"
            title={
              <>
                Moments from <span className="display-italic">Poppin.</span>
              </>
            }
            intro="Real photos from previous Poppin markets. Tap any photo to view it full size."
          />
          <Gallery items={GALLERY} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="faq-title" id="faq">
        <div className="container-narrow">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Good to know" align="center" />
          <Faq items={homeFaqs} />
        </div>
      </section>

      <InstagramSection />
      <Newsletter />
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { announcements: await publishedAnnouncements(3) }, revalidate: 120 };
}
