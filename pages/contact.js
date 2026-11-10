import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import Reveal from '@/components/ui/Reveal';
import Icon from '@/components/ui/Icon';
import Faq from '@/components/ui/Faq';
import SectionHeading from '@/components/ui/SectionHeading';
import { CONTACT, WHATSAPP_MESSAGES, whatsappLink } from '@/lib/config/site';
import { WINTER_CARNIVAL as E, VENUE_TBA_LABEL } from '@/lib/config/event';
import { FAQS } from '@/lib/data/faqs';
import { track } from '@/lib/analytics';
import p from '@/styles/pages.module.css';

export default function Contact() {
  const cards = [
    {
      icon: 'phone',
      title: 'Call us',
      body: 'Stall bookings and general questions.',
      action: CONTACT.phoneDisplay,
      href: `tel:${CONTACT.phoneE164}`,
      method: 'call',
    },
    {
      icon: 'whatsapp',
      title: 'WhatsApp',
      body: 'Message us any time. We’ll reply as soon as we can.',
      action: 'Start a chat',
      href: whatsappLink(WHATSAPP_MESSAGES.general),
      external: true,
      method: 'whatsapp',
    },
    {
      icon: 'instagram',
      title: 'Instagram',
      body: 'Updates, the venue reveal and DMs.',
      action: CONTACT.instagramHandle,
      href: CONTACT.instagramUrl,
      external: true,
      method: 'instagram',
    },
  ];
  return (
    <Layout seo={{ title: 'Contact', description: `Contact the Poppin team. Call or WhatsApp ${CONTACT.phone}, or DM ${CONTACT.instagramHandle}.` }}>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Say <span className="display-italic">hello.</span>
          </>
        }
        intro={`For ${E.fullName} stall bookings, call or WhatsApp ${CONTACT.phone}.`}
      />
      <section className="section bg-cream">
        <div className="container">
          <ul className={p.contactGrid}>
            {cards.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 80}>
                <a
                  href={c.href}
                  className={p.contactCard}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => track('contact_click', { method: c.method, location: 'contact_page' })}
                >
                  <span className={p.contactIcon}>
                    <Icon name={c.icon} size={26} />
                  </span>
                  <h2>{c.title}</h2>
                  <p className="muted">{c.body}</p>
                  <span className={p.contactAction}>
                    {c.action} <Icon name="arrowUpRight" size={18} />
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>

          <Reveal className={p.contactStrip}>
            <div>
              <p className="eyebrow">{E.fullName}</p>
              <p className={p.contactStripText}>
                {E.dateLabelLong} · {E.locationLabel} · <span className="chip chip-tba">{VENUE_TBA_LABEL}</span>
              </p>
            </div>
            <Link href="/book-a-stall" className="btn btn-burgundy">
              Stall enquiry form <Icon name="arrowRight" />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section bg-white" aria-labelledby="contact-faq">
        <div className="container-narrow">
          <SectionHeading id="contact-faq" eyebrow="FAQ" title="Before you ask…" align="center" />
          <Faq items={FAQS.filter((_, i) => [1, 2, 4, 6, 9].includes(i))} />
        </div>
      </section>
    </Layout>
  );
}
