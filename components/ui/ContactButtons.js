import Link from 'next/link';
import Icon from './Icon';
import { CONTACT, WHATSAPP_MESSAGES, whatsappLink } from '@/lib/config/site';
import { track } from '@/lib/analytics';

// Reserve / Call / WhatsApp trio used wherever stall booking is promoted.
export default function ContactButtons({ reserve = true, reserveLabel = 'Reserve your stall', size, location = 'unknown', outlineTone }) {
  const sz = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '';
  return (
    <div className="btn-row">
      {reserve && (
        <Link href="/book-a-stall" className={`btn btn-primary ${sz}`} onClick={() => track('cta_click', { cta: 'reserve_stall', location })}>
          {reserveLabel}
          <Icon name="arrowRight" />
        </Link>
      )}
      <a href={`tel:${CONTACT.phoneE164}`} className={`btn btn-outline ${sz}`} style={outlineTone} onClick={() => track('contact_click', { method: 'call', location })}>
        <Icon name="phone" />
        Call {CONTACT.phone}
      </a>
      <a
        href={whatsappLink(WHATSAPP_MESSAGES.stall)}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-whatsapp ${sz}`}
        onClick={() => track('contact_click', { method: 'whatsapp', location })}
      >
        <Icon name="whatsapp" />
        WhatsApp
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
