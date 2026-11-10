import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import EnquiryForm from '@/components/forms/EnquiryForm';
import Icon from '@/components/ui/Icon';
import Countdown from '@/components/ui/Countdown';
import { WINTER_CARNIVAL as E, VENUE_TBA_LABEL } from '@/lib/config/event';
import { CONTACT, WHATSAPP_MESSAGES, whatsappLink } from '@/lib/config/site';
import { track } from '@/lib/analytics';
import p from '@/styles/pages.module.css';

export default function BookAStall() {
  return (
    <Layout
      stickyCta={false}
      seo={{
        title: `Book a stall — ${E.fullName}`,
        description: `Stall pre-bookings are open for ${E.fullName}, ${E.dateLabel} in Patna. Limited stalls. Send an enquiry or call ${CONTACT.phone}.`,
      }}
    >
      <PageHeader
        eyebrow={`${E.fullName} · Stall pre-bookings open`}
        title={
          <>
            Let’s get your brand <span className="display-italic">to Poppin!</span>
          </>
        }
        intro={E.stalls.pitch}
      />

      <section className="section bg-cream">
        <div className={`container ${p.formLayout}`}>
          <div className={p.formCard}>
            <EnquiryForm />
          </div>

          <aside className={p.formAside} aria-label="Event details and other ways to book">
            <div className={p.asideCard}>
              <h2 className={p.asideTitle}>The event</h2>
              <ul className={p.asideList}>
                <li>
                  <Icon name="calendar" size={18} /> {E.dateLabelLong}
                </li>
                <li>
                  <Icon name="pin" size={18} /> {E.locationLabel}
                </li>
                <li>
                  <span className="chip chip-tba">{VENUE_TBA_LABEL}</span>
                </li>
                <li>
                  <Icon name="ticket" size={18} /> Limited stalls available
                </li>
              </ul>
              <Countdown tone="light" compact />
            </div>

            <div className={`${p.asideCard} ${p.asideDark} tone-dark`}>
              <h2 className={p.asideTitle}>Prefer to talk?</h2>
              <p className="muted">Call to reserve your spot, or message us on WhatsApp.</p>
              <a href={`tel:${CONTACT.phoneE164}`} className={p.asidePhone} onClick={() => track('contact_click', { method: 'call', location: 'book_aside' })}>
                {CONTACT.phone}
              </a>
              <div className="btn-row">
                <a href={`tel:${CONTACT.phoneE164}`} className="btn btn-primary btn-sm" onClick={() => track('contact_click', { method: 'call', location: 'book_aside' })}>
                  <Icon name="phone" /> Call now
                </a>
                <a
                  href={whatsappLink(WHATSAPP_MESSAGES.stall)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                  onClick={() => track('contact_click', { method: 'whatsapp', location: 'book_aside' })}
                >
                  <Icon name="whatsapp" /> WhatsApp
                </a>
              </div>
            </div>

            <div className={p.asideCard}>
              <h2 className={p.asideTitle}>Good to know</h2>
              <ul className={p.asideNotes}>
                <li>Submitting the form is an enquiry, not a confirmed booking.</li>
                <li>Stall pricing, sizes and inclusions are shared by the team when they contact you.</li>
                <li>
                  Questions? See the{' '}
                  <Link href="/winter-carnival#faq" className="link">
                    carnival FAQ
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
