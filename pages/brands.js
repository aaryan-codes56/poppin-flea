import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { BrandWall, PartnerWall } from '@/components/sections/Showcase';
import { StallSpotlight } from '@/components/sections/EventSections';

export default function Brands() {
  return (
    <Layout
      seo={{
        title: 'Brands at Poppin',
        description: 'Independent brands and home-grown businesses that have set up shop at Poppin flea markets in Patna.',
      }}
    >
      <PageHeader
        eyebrow="Brand directory"
        title={
          <>
            The brands that make <span className="display-italic">Poppin pop.</span>
          </>
        }
        intro="Every brand listed here has taken part in a previous Poppin market. We only list brands we can verify, so the directory grows as we confirm our vendor archive."
      />
      <BrandWall heading={false} />
      <PartnerWall />
      <StallSpotlight />
    </Layout>
  );
}
