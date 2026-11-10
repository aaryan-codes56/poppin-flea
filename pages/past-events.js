import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import Gallery from '@/components/ui/Gallery';
import { EventCard, InstagramSection } from '@/components/sections/Showcase';
import { StallSpotlight } from '@/components/sections/EventSections';
import { PAST_EVENTS } from '@/lib/data/events';
import { GALLERY } from '@/lib/data/gallery';
import p from '@/styles/pages.module.css';

export default function PastEvents() {
  const years = [...new Set(PAST_EVENTS.map((e) => e.year))];
  return (
    <Layout
      seo={{
        title: 'Past events',
        description: 'The Poppin event archive: Christmas markets, the Valentine Edition, Garda Holi Festival and Garda Garba in Patna.',
      }}
    >
      <PageHeader
        eyebrow="Event archive"
        title={
          <>
            Every edition, <span className="display-italic">so far.</span>
          </>
        }
        intro="Christmas markets, Valentine’s, Holi and Navratri: the Poppin markets and co-productions that brought Patna together."
      />
      <section className="section bg-cream">
        <div className="container">
          {years.map((y) => (
            <div key={y} className={p.yearBlock}>
              <h2 className={p.yearTitle}>{y}</h2>
              <ul className={p.archiveGrid}>
                {PAST_EVENTS.filter((e) => e.year === y).map((e, i) => (
                  <EventCard key={e.slug} event={e} index={i} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="section bg-white" aria-labelledby="pe-gallery">
        <div className="container">
          <SectionHeading id="pe-gallery" eyebrow="Gallery" title="From the archive" />
          <Gallery items={GALLERY} />
        </div>
      </section>
      <InstagramSection
        eyebrow="Poppin Christmas 2025"
        title={
          <>
            Relive the <span className="display-italic">2025 edition.</span>
          </>
        }
        intro="Reels and posts from Cafe The Cartel, 24–26 December 2025, shared by Poppin, Garda Patna, our brands and visitors."
      />
      <StallSpotlight />
    </Layout>
  );
}
