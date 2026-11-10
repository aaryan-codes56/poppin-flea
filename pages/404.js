import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';

export default function NotFound() {
  return (
    <Layout seo={{ title: 'Page not found', noindex: true }}>
      <PageHeader
        eyebrow="404"
        title={
          <>
            This stall has <span className="display-italic">packed up.</span>
          </>
        }
        intro="The page you’re looking for doesn’t exist or has moved."
      >
        <div className="btn-row" style={{ marginTop: '1.5rem' }}>
          <Link href="/" className="btn btn-primary">
            Back home
          </Link>
          <Link href="/winter-carnival" className="btn btn-outline">
            Winter Carnival 2026
          </Link>
        </div>
      </PageHeader>
    </Layout>
  );
}
