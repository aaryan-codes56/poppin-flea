import Link from 'next/link';
import Image from 'next/image';
import Icon from '../ui/Icon';
import StringLights from '../ui/StringLights';
import { NAV_LINKS, CONTACT, WHATSAPP_MESSAGES, whatsappLink, SITE } from '@/lib/config/site';
import { WINTER_CARNIVAL as E, VENUE_TBA_LABEL } from '@/lib/config/event';
import styles from './layout.module.css';

// No admin links here, on purpose.
export default function Footer() {
  return (
    <footer className={`${styles.footer} tone-dark`}>
      <StringLights count={26} className={styles.footerLights} />
      <div className="container">
        <div className={styles.footerCta}>
          <div>
            <p className="eyebrow">Stall pre-bookings open</p>
            <h2 className={styles.footerCtaTitle}>
              Bring your brand to the <span className="display-italic">Winter Carnival.</span>
            </h2>
          </div>
          <Link href="/book-a-stall" className="btn btn-primary btn-lg">
            Enquire for a stall <Icon name="arrowRight" />
          </Link>
        </div>

        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Image src="/brand/poppin-logo.png" alt="Poppin Fun & Flea" width={640} height={292} className={styles.footerLogo} />
            <p className="muted">{SITE.description}</p>
            <p className="muted">
              Presented with{' '}
              <a href={SITE.organiser.instagram} target="_blank" rel="noopener noreferrer" className="link">
                Garda Patna
              </a>
              .
            </p>
          </div>

          <div>
            <h3 className={styles.footerHead}>{E.fullName}</h3>
            <ul className={styles.footerList}>
              <li>
                <Icon name="calendar" size={18} /> {E.dateLabelLong}
              </li>
              <li>
                <Icon name="pin" size={18} /> {E.locationLabel}
              </li>
              <li>
                <span className="chip chip-tba">{VENUE_TBA_LABEL}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHead}>Explore</h3>
            <ul className={styles.footerList}>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.footerLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/book-a-stall" className={styles.footerLink}>
                  Stall enquiry
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHead}>Contact</h3>
            <ul className={styles.footerList}>
              <li>
                <a href={`tel:${CONTACT.phoneE164}`} className={styles.footerLink}>
                  <Icon name="phone" size={18} /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={whatsappLink(WHATSAPP_MESSAGES.general)} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                  <Icon name="whatsapp" size={18} /> WhatsApp us
                </a>
              </li>
              <li>
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                  <Icon name="instagram" size={18} /> {CONTACT.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Poppin Fun &amp; Flea, Patna. All rights reserved.</p>
          <ul>
            <li>
              <Link href="/privacy" className={styles.footerLink}>
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className={styles.footerLink}>
                Terms &amp; conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
