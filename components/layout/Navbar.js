import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Icon from '../ui/Icon';
import { NAV_LINKS, CONTACT, WHATSAPP_MESSAGES, whatsappLink } from '@/lib/config/site';
import { WINTER_CARNIVAL as E } from '@/lib/config/event';
import { track } from '@/lib/analytics';
import styles from './layout.module.css';

// Public navigation. There is intentionally no admin link here.
export default function Navbar({ overlay = false }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 480);
        last = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = panelRef.current?.querySelector('a');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = [toggleRef.current, ...panelRef.current.querySelectorAll('a')];
        const firstEl = nodes[0];
        const lastEl = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href) => (href === '/' ? router.pathname === '/' : router.pathname.startsWith(href));
  const solid = scrolled || !overlay || open;

  return (
    <header
      className={`${styles.nav} ${solid ? styles.navSolid : styles.navClear} ${hidden && !open ? styles.navHidden : ''}`}
      onFocus={() => setHidden(false)}
    >
      <div className={`container ${styles.navInner}`}>
        <Link href="/" className={styles.brand} aria-label="Poppin — home">
          <Image src="/brand/poppin-logo.png" alt="Poppin Fun & Flea" width={640} height={292} preload className={styles.brandLogo} />
        </Link>

        <nav aria-label="Main" className={styles.desktopNav}>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.navLink} aria-current={isActive(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.navActions}>
          <Link href="/book-a-stall" className={`btn btn-primary btn-sm ${styles.navCta}`} onClick={() => track('cta_click', { cta: 'book_stall', location: 'nav' })}>
            Book a stall
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={panelRef} className={styles.mobilePanel} hidden={!open}>
        <nav aria-label="Mobile">
          <ul className={styles.mobileList}>
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} style={{ '--i': i }}>
                <Link href={l.href} className={styles.mobileLink} aria-current={isActive(l.href) ? 'page' : undefined}>
                  {l.label}
                  <Icon name="arrowRight" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileFooter}>
          <p className={styles.mobileMeta}>
            {E.fullName} · {E.dateLabel} · {E.locationLabel}
          </p>
          <Link href="/book-a-stall" className="btn btn-primary btn-lg">
            Book a stall <Icon name="arrowRight" />
          </Link>
          <div className="btn-row">
            <a href={`tel:${CONTACT.phoneE164}`} className="btn btn-outline btn-sm" onClick={() => track('contact_click', { method: 'call', location: 'mobile_menu' })}>
              <Icon name="phone" /> Call
            </a>
            <a
              href={whatsappLink(WHATSAPP_MESSAGES.stall)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
              onClick={() => track('contact_click', { method: 'whatsapp', location: 'mobile_menu' })}
            >
              <Icon name="whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
