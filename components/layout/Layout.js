import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from './Navbar';
import Footer from './Footer';
import Seo from './Seo';
import Icon from '../ui/Icon';
import { ScrollProgress } from '../ui/motion';
import { CONTACT, WHATSAPP_MESSAGES, whatsappLink } from '@/lib/config/site';
import { captureSource, track } from '@/lib/analytics';
import styles from './layout.module.css';

const PLAUSIBLE = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

// Sticky bottom bar on phones: appears after the first screen of scrolling.
function MobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`${styles.mobileCta} ${show ? styles.mobileCtaShow : ''}`} aria-hidden={!show}>
      <Link href="/book-a-stall" className="btn btn-primary" tabIndex={show ? 0 : -1} onClick={() => track('cta_click', { cta: 'book_stall', location: 'sticky' })}>
        Book a stall
      </Link>
      <a
        href={whatsappLink(WHATSAPP_MESSAGES.stall)}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-whatsapp ${styles.mobileCtaIcon}`}
        aria-label="WhatsApp the organisers"
        tabIndex={show ? 0 : -1}
        onClick={() => track('contact_click', { method: 'whatsapp', location: 'sticky' })}
      >
        <Icon name="whatsapp" />
      </a>
      <a
        href={`tel:${CONTACT.phoneE164}`}
        className={`btn btn-burgundy ${styles.mobileCtaIcon}`}
        aria-label={`Call ${CONTACT.phone}`}
        tabIndex={show ? 0 : -1}
        onClick={() => track('contact_click', { method: 'call', location: 'sticky' })}
      >
        <Icon name="phone" />
      </a>
    </div>
  );
}

export default function Layout({ children, seo = {}, overlayNav = false, stickyCta = true }) {
  useEffect(() => captureSource(), []);
  return (
    <>
      <Seo {...seo} />
      {PLAUSIBLE && <Script defer data-domain={PLAUSIBLE} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      <ScrollProgress />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar overlay={overlayNav} />
      <main id="main" tabIndex={-1} className={overlayNav ? '' : styles.mainOffset}>
        {children}
      </main>
      <Footer />
      {stickyCta && <MobileCta />}
    </>
  );
}
