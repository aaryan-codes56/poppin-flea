import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE } from '@/lib/config/site';

const DEFAULT_IMAGE = '/og/winter-carnival-2026.jpg';

export default function Seo({ title, description, image = DEFAULT_IMAGE, imageAlt, noindex = false, jsonLd, path }) {
  const router = useRouter();
  const pathname = path ?? (router.asPath || '/').split(/[?#]/)[0];
  const canonical = `${SITE.url}${pathname === '/' ? '' : pathname}`;
  const fullTitle = title ? `${title} | Poppin` : 'Poppin — Patna’s flea market & festive events';
  const desc = description || SITE.description;
  const img = image.startsWith('http') ? image : `${SITE.url}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={canonical} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Poppin" />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt || 'Poppin Winter Carnival 2026 — 23–25 December, Patna'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON-LD is built from our own config, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
    </Head>
  );
}
