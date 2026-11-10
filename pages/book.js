// Customer table booking — the original flow (form → UPI payment → screenshot
// → pending verification), restyled and driven by lib/config/tableBooking.js.
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import Icon from '@/components/ui/Icon';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import { WINTER_CARNIVAL as E } from '@/lib/config/event';
import f from '@/components/forms/forms.module.css';
import p from '@/styles/pages.module.css';

const INITIAL = {
  name: '', phone: '', email: '', area: TABLE_BOOKING.areas[1]?.name || TABLE_BOOKING.areas[0].name,
  date: '', timeSlot: TABLE_BOOKING.timeSlots[0], adults: 1, children: 0, comments: '',
};

function Closed() {
  return (
    <section className="section bg-cream">
      <div className={`container-narrow ${p.legal}`}>
        <h2>Table bookings are closed right now</h2>
        <p>
          Table reservations were available for {TABLE_BOOKING.edition} at {TABLE_BOOKING.venue.name}. If table bookings open for {E.fullName}, you’ll
          be able to reserve here once the venue is announced.
        </p>
        <div className="btn-row">
          <Link href="/winter-carnival" className="btn btn-burgundy">
            Winter Carnival 2026 <Icon name="arrowRight" />
          </Link>
          <Link href="/book-a-stall" className="btn btn-outline">
            Book a stall instead
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Book() {
  const [form, setForm] = useState(INITIAL);
  const [payment, setPayment] = useState({ transactionId: '', upiName: '', screenshot: null });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [availability, setAvailability] = useState({});
  const [refId, setRefId] = useState('');

  useEffect(() => {
    if (!form.date) return;
    fetch(`/api/getSlots?date=${encodeURIComponent(form.date)}`)
      .then((r) => r.json())
      .then((d) => setAvailability(d.availability || {}))
      .catch(() => setAvailability({}));
  }, [form.date]);

  useEffect(() => {
    if (!showPayment) return;
    const onKey = (e) => e.key === 'Escape' && setShowPayment(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPayment]);

  if (!TABLE_BOOKING.enabled) {
    return (
      <Layout seo={{ title: 'Table bookings', noindex: true }}>
        <PageHeader eyebrow="Table reservations" title="Reserve a table" />
        <Closed />
      </Layout>
    );
  }

  const slotInfo = availability[form.timeSlot]?.[form.area];
  const remaining = slotInfo ? Math.max(0, slotInfo.limit - slotInfo.count) : null;
  const total = (Number(form.adults || 0) + Number(form.children || 0)) * TABLE_BOOKING.pricePerGuest;
  const onChange = (e) => setForm((x) => ({ ...x, [e.target.name]: e.target.value }));

  function proceed(e) {
    e.preventDefault();
    setMessage('');
    if (!TABLE_BOOKING.dates.some((d) => d.value === form.date)) {
      setStatus('error');
      setMessage('Please select a valid date.');
      return;
    }
    if (remaining !== null && Number(form.adults) > remaining) {
      setStatus('error');
      setMessage(remaining === 0 ? 'This slot is full for the selected area.' : `Only ${remaining} spot${remaining !== 1 ? 's' : ''} left for this slot.`);
      return;
    }
    setStatus('idle');
    setShowPayment(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('transactionId', payment.transactionId);
    data.append('upiName', payment.upiName);
    if (payment.screenshot) data.append('screenshot', payment.screenshot);
    try {
      const res = await fetch('/api/createBooking', { method: 'POST', body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Something went wrong.');
      setRefId(json.refId);
      setStatus('success');
      setShowPayment(false);
      setForm(INITIAL);
      setPayment({ transactionId: '', upiName: '', screenshot: null });
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
      setShowPayment(false);
    }
  }

  return (
    <Layout seo={{ title: 'Reserve a table', description: `Reserve a table at ${TABLE_BOOKING.venue.name} for ${TABLE_BOOKING.edition}.` }}>
      <PageHeader eyebrow={TABLE_BOOKING.edition} title="Reserve your table" intro={`${TABLE_BOOKING.venue.name}, ${TABLE_BOOKING.venue.address}`} />
      <section className="section bg-cream">
        <div className="container-narrow">
          <div className={p.formCard}>
            {status === 'success' ? (
              <div className={f.success} role="status">
                <span className={f.successIcon}>
                  <Icon name="check" size={30} />
                </span>
                <h2>Request received!</h2>
                <p className={f.refBox}>
                  <span>Reference ID · Pending verification</span>
                  <strong>#{refId}</strong>
                </p>
                <p className="muted">We’ll verify your payment (approx. 12–15 hrs) and email your confirmation.</p>
                <button className="btn btn-burgundy" onClick={() => setStatus('idle')}>
                  Book another
                </button>
              </div>
            ) : (
              <form className={f.form} onSubmit={proceed}>
                <div className={f.grid2}>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="name">Full name</label>
                    <input className={f.input} id="name" name="name" required value={form.name} onChange={onChange} autoComplete="name" />
                  </div>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="phone">Phone</label>
                    <input className={f.input} id="phone" name="phone" type="tel" required value={form.phone} onChange={onChange} autoComplete="tel" />
                  </div>
                </div>
                <div className={f.field}>
                  <label className={f.label} htmlFor="email">Email</label>
                  <input className={f.input} id="email" name="email" type="email" required value={form.email} onChange={onChange} autoComplete="email" />
                </div>
                <div className={f.grid2}>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="date">Date</label>
                    <select className={f.input} id="date" name="date" required value={form.date} onChange={onChange}>
                      <option value="">Select a date</option>
                      {TABLE_BOOKING.dates.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="area">Area</label>
                    <select className={f.input} id="area" name="area" value={form.area} onChange={onChange}>
                      {TABLE_BOOKING.areas.map((a) => (
                        <option key={a.name}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <fieldset className={f.fieldset}>
                  <legend className={f.label}>Time slot ({TABLE_BOOKING.slotMinutes} mins)</legend>
                  <div className={p.slotGrid}>
                    {TABLE_BOOKING.timeSlots.map((slot) => {
                      const info = availability[slot]?.[form.area];
                      const full = info?.status === 'red';
                      const left = form.date && info ? Math.max(0, info.limit - info.count) : null;
                      return (
                        <button
                          type="button"
                          key={slot}
                          className={`${p.slot} ${p[`slot_${info?.status || 'green'}`]}`}
                          aria-pressed={form.timeSlot === slot}
                          disabled={full}
                          onClick={() => setForm((x) => ({ ...x, timeSlot: slot }))}
                        >
                          {slot}
                          {left !== null && <small>{full ? 'Full' : `${left} left`}</small>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div className={f.grid2}>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="adults">Adults</label>
                    <input className={f.input} id="adults" name="adults" type="number" min="1" max={remaining ?? undefined} required value={form.adults} onChange={onChange} />
                  </div>
                  <div className={f.field}>
                    <label className={f.label} htmlFor="children">Children</label>
                    <input className={f.input} id="children" name="children" type="number" min="0" value={form.children} onChange={onChange} />
                  </div>
                </div>
                <div className={f.field}>
                  <label className={f.label} htmlFor="comments">Special requests</label>
                  <textarea className={f.input} id="comments" name="comments" rows={3} value={form.comments} onChange={onChange} />
                </div>
                {status === 'error' && <p className={f.alert} role="alert">{message}</p>}
                <button type="submit" className="btn btn-primary btn-lg">
                  Proceed to payment <Icon name="arrowRight" />
                </button>
                <p className={f.hint}>For any queries: {TABLE_BOOKING.queriesPhone}</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {showPayment && (
        <div className={p.modal} role="dialog" aria-modal="true" aria-labelledby="pay-title" onClick={() => setShowPayment(false)}>
          <div className={p.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={p.modalClose} onClick={() => setShowPayment(false)} aria-label="Close payment">
              <Icon name="close" />
            </button>
            <h2 id="pay-title">Scan to pay</h2>
            <Image src="/payment-qr.png" alt="UPI payment QR code" width={240} height={340} className={p.qr} />
            <p className={p.total}>
              Total: Rs. {total}
              <small>
                ({form.adults} adults + {form.children} children) × Rs. {TABLE_BOOKING.pricePerGuest}
              </small>
            </p>
            <form onSubmit={submit} className={f.form}>
              <div className={f.field}>
                <label className={f.label} htmlFor="transactionId">Transaction ID / UTR</label>
                <input className={f.input} id="transactionId" required value={payment.transactionId} onChange={(e) => setPayment((x) => ({ ...x, transactionId: e.target.value }))} />
              </div>
              <div className={f.field}>
                <label className={f.label} htmlFor="upiName">Name on UPI</label>
                <input className={f.input} id="upiName" required value={payment.upiName} onChange={(e) => setPayment((x) => ({ ...x, upiName: e.target.value }))} />
              </div>
              <div className={f.field}>
                <label className={f.label} htmlFor="screenshot">Payment screenshot (max 5 MB)</label>
                <input className={f.input} id="screenshot" type="file" accept="image/*" required onChange={(e) => setPayment((x) => ({ ...x, screenshot: e.target.files[0] }))} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'}>
                {status === 'loading' ? 'Uploading & submitting…' : 'Confirm booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// While table bookings are switched off, send visitors to the stall enquiry page.
export function getServerSideProps() {
  if (!TABLE_BOOKING.enabled) return { redirect: { destination: '/book-a-stall', permanent: false } };
  return { props: {} };
}
