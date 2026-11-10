import { useState } from 'react';
import Icon from '../ui/Icon';
import { api } from './api';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import a from './admin.module.css';

const EMPTY = {
  name: '', phone: '', email: '', area: TABLE_BOOKING.areas[0].name, date: TABLE_BOOKING.dates[0].value,
  timeSlot: TABLE_BOOKING.timeSlots[0], adults: 1, children: 0, transactionId: '', comments: '',
};

// Customer table bookings (the original admin features, kept separate from vendor enquiries).
export default function BookingsPanel({ bookings, reload, loading, error }) {
  const [busy, setBusy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  async function act(booking, path, body, label) {
    if (!confirm(label)) return;
    setBusy(booking.rowIndex);
    try {
      await api(path, { method: 'POST', body });
      await reload();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function onSpot(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('isOnSpot', 'true');
      const res = await fetch('/api/createBooking', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Booking failed');
      alert(`Booking successful! Ref ID: #${json.refId}`);
      setForm(EMPTY);
      setShowForm(false);
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const total = (Number(form.adults || 0) + Number(form.children || 0)) * TABLE_BOOKING.pricePerGuest;

  return (
    <section aria-labelledby="bk-title">
      <div className={a.panelHead}>
        <div>
          <h2 id="bk-title">Table bookings</h2>
          <p className={a.muted}>
            {TABLE_BOOKING.edition} · {TABLE_BOOKING.venue.name} · Public booking is {TABLE_BOOKING.enabled ? 'open' : 'closed'}
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-outline btn-sm" onClick={reload}>
            <Icon name="refresh" /> Refresh
          </button>
          <button className="btn btn-burgundy btn-sm" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm}>
            {showForm ? 'Close form' : '+ On-spot registration'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className={a.onSpot} onSubmit={onSpot}>
          <input className={a.input} name="name" placeholder="Name" required value={form.name} onChange={set} aria-label="Name" />
          <input className={a.input} name="phone" placeholder="Phone" required value={form.phone} onChange={set} aria-label="Phone" />
          <input className={a.input} name="email" type="email" placeholder="Email" required value={form.email} onChange={set} aria-label="Email" />
          <select className={a.input} name="area" value={form.area} onChange={set} aria-label="Area">
            {TABLE_BOOKING.areas.map((x) => (
              <option key={x.name}>{x.name}</option>
            ))}
          </select>
          <select className={a.input} name="date" value={form.date} onChange={set} aria-label="Date">
            {TABLE_BOOKING.dates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <select className={a.input} name="timeSlot" value={form.timeSlot} onChange={set} aria-label="Time slot">
            {TABLE_BOOKING.timeSlots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input className={a.input} name="adults" type="number" min="1" value={form.adults} onChange={set} aria-label="Adults" />
          <input className={a.input} name="children" type="number" min="0" value={form.children} onChange={set} aria-label="Children" />
          <input className={a.input} name="transactionId" placeholder="Transaction ID / UTR" required value={form.transactionId} onChange={set} aria-label="Transaction ID" />
          <input className={a.input} name="comments" placeholder="Comments" value={form.comments} onChange={set} aria-label="Comments" />
          <p className={a.totalBar}>
            Total: Rs. {total} ({form.adults} adults + {form.children} children)
          </p>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Booking…' : 'Book now'}
          </button>
        </form>
      )}

      {error && <p className={a.error}>{error}</p>}
      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Guest</th>
              <th>Area · Date · Time</th>
              <th>Guests</th>
              <th>Payment</th>
              <th>Comments</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8}>
                  <div className="skeleton" style={{ height: 20 }} />
                </td>
              </tr>
            )}
            {!loading &&
              bookings.map((b) => (
                <tr key={b.rowIndex}>
                  <td className={a.mono}>#{b.refId}</td>
                  <td>
                    <strong>{b.name}</strong>
                    <div className={a.muted}>{b.phone}</div>
                    <div className={a.muted}>{b.email}</div>
                  </td>
                  <td>
                    {b.area}
                    <div className={a.muted}>
                      {b.date} · {b.timeSlot || '—'}
                    </div>
                  </td>
                  <td>
                    {b.adults} A · {b.children} C
                  </td>
                  <td className={a.small}>
                    <div>Txn: {b.transactionId || 'N/A'}</div>
                    <div>UPI: {b.upiName || 'N/A'}</div>
                    {b.screenshotLink && /^https:\/\//.test(b.screenshotLink) && (
                      <a href={b.screenshotLink} target="_blank" rel="noopener noreferrer" className="link">
                        View screenshot
                      </a>
                    )}
                  </td>
                  <td className={a.small} title={b.comments}>
                    {b.comments}
                  </td>
                  <td>
                    <span className={`${a.badge} ${a[`bk_${b.status.replace(/\s+/g, '')}`] || ''}`}>{b.status}</span>
                  </td>
                  <td>
                    <div className={a.actions}>
                      {b.status === 'Pending Verification' && (
                        <button
                          className={`${a.actBtn} ${a.actVerify}`}
                          disabled={busy === b.rowIndex}
                          onClick={() => act(b, '/api/confirmPayment', { rowIndex: b.rowIndex }, `Verify payment for ${b.name} (Txn: ${b.transactionId})? This confirms the booking and emails the guest.`)}
                        >
                          Verify payment
                        </button>
                      )}
                      {(b.status === 'Reserved' || b.status === 'Confirmed') && (
                        <button
                          className={`${a.actBtn} ${a.actArrived}`}
                          disabled={busy === b.rowIndex}
                          onClick={() => act(b, '/api/updateBookingStatus', { rowIndex: b.rowIndex, status: 'Guest Arrived' }, 'Mark this booking as Guest Arrived?')}
                        >
                          Guest arrived
                        </button>
                      )}
                      {!['Cancelled', 'Guest Arrived', 'Arrived'].includes(b.status) && (
                        <button
                          className={`${a.actBtn} ${a.actCancel}`}
                          disabled={busy === b.rowIndex}
                          onClick={() => act(b, '/api/cancelBooking', { rowIndex: b.rowIndex }, 'Cancel this booking? The guest will be emailed.')}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !bookings.length && (
              <tr>
                <td colSpan={8} className={a.empty}>
                  No table bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
