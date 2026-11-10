import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { api, fmtDate, todayIST } from './api';
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_KEYS, OPEN_STATUSES } from '@/lib/config/crm';
import { VENDOR_CATEGORIES } from '@/lib/config/event';
import a from './admin.module.css';

export function StatusBadge({ status }) {
  const tone = ENQUIRY_STATUSES.find((s) => s.key === status)?.tone || 'neutral';
  return <span className={`${a.badge} ${a[`tone_${tone}`]}`}>{status}</span>;
}

function Drawer({ enquiry, onClose, onSaved }) {
  const [status, setStatus] = useState(enquiry.status);
  const [followUp, setFollowUp] = useState(enquiry.followUpDate || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dirty = status !== enquiry.status || followUp !== (enquiry.followUpDate || '') || note.trim();

  async function save(nextStatus = status) {
    if (nextStatus === 'Confirmed' && enquiry.status !== 'Confirmed' && !confirm(`Mark ${enquiry.brandName} as CONFIRMED? Only do this once the stall is agreed.`)) return;
    setSaving(true);
    setError('');
    try {
      const { enquiry: updated } = await api(`/api/admin/enquiries/${enquiry.ref}`, {
        method: 'PATCH',
        body: { status: nextStatus, followUpDate: followUp, note },
      });
      setNote('');
      onSaved(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const wa = `https://wa.me/91${enquiry.phone}?text=${encodeURIComponent(`Hi ${enquiry.contactName}, this is the Poppin team about your stall enquiry ${enquiry.ref} for ${enquiry.brandName}.`)}`;

  return (
    <div className={a.drawerWrap} onClick={onClose}>
      <aside className={a.drawer} role="dialog" aria-modal="true" aria-labelledby="drawer-title" onClick={(e) => e.stopPropagation()}>
        <div className={a.drawerHead}>
          <div>
            <p className={a.mono}>{enquiry.ref}</p>
            <h2 id="drawer-title">{enquiry.brandName}</h2>
            <StatusBadge status={enquiry.status} />
          </div>
          <button ref={closeRef} className={a.iconBtn} onClick={onClose} aria-label="Close details">
            <Icon name="close" />
          </button>
        </div>

        <div className={a.quick}>
          <a href={`tel:+91${enquiry.phone}`} className="btn btn-burgundy btn-sm">
            <Icon name="phone" /> Call
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
            <Icon name="whatsapp" /> WhatsApp
          </a>
          <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Poppin Winter Carnival — ${enquiry.ref}`)}`} className="btn btn-outline btn-sm">
            <Icon name="mail" /> Email
          </a>
        </div>

        <dl className={a.details}>
          {[
            ['Contact', enquiry.contactName],
            ['Phone', enquiry.phone],
            ['Email', enquiry.email],
            ['Instagram', enquiry.instagram ? `@${enquiry.instagram}` : '—'],
            ['Category', enquiry.category],
            ['Stall preference', enquiry.stallPreference],
            ['Products / services', enquiry.description],
            ['Requirements', enquiry.requirements || '—'],
            ['Submitted', fmtDate(enquiry.createdAt)],
            ['Source', enquiry.source || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                {k === 'Instagram' && enquiry.instagram ? (
                  <a href={`https://www.instagram.com/${enquiry.instagram}/`} target="_blank" rel="noopener noreferrer" className="link">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className={a.editBox}>
          <h3>Quick update</h3>
          <div className={a.quickStatus} role="group" aria-label="Set status">
            {['Contacted', 'Interested', 'Approved', 'Payment Pending', 'Confirmed', 'Rejected'].map((s) => (
              <button
                key={s}
                type="button"
                className={`${a.statusChip} ${enquiry.status === s ? a.statusChipOn : ''}`}
                aria-pressed={enquiry.status === s}
                disabled={saving || enquiry.status === s}
                onClick={() => save(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <h3>Update details</h3>
          <div className={a.row2}>
            <label className={a.label}>
              Status
              <select className={a.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.key} — {s.hint}
                  </option>
                ))}
              </select>
            </label>
            <label className={a.label}>
              Follow-up date
              <input type="date" className={a.input} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            </label>
          </div>
          <label className={a.label}>
            Internal note (only visible to organisers)
            <textarea className={a.input} rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="e.g. Called, wants a corner stall, will confirm by Friday" />
          </label>
          {error && <p className={a.error}>{error}</p>}
          <button className="btn btn-primary" onClick={() => save()} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        <div className={a.history}>
          <h3>Activity</h3>
          {enquiry.notes ? (
            <ul>
              {enquiry.notes.split('\n').map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className={a.muted}>No activity yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function EnquiriesPanel({ enquiries, setEnquiries, role, loading, initialFilter }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(initialFilter?.status || 'All');
  const [category, setCategory] = useState('All');
  const [followOnly, setFollowOnly] = useState(Boolean(initialFilter?.followUps));
  const [selected, setSelected] = useState(null);
  const today = todayIST();

  useEffect(() => {
    if (initialFilter) {
      setStatus(initialFilter.status || 'All');
      setFollowOnly(Boolean(initialFilter.followUps));
    }
  }, [initialFilter]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (status !== 'All' && e.status !== status) return false;
      if (category !== 'All' && e.category !== category) return false;
      if (followOnly && !(e.followUpDate && e.followUpDate <= today && OPEN_STATUSES.includes(e.status))) return false;
      if (!needle) return true;
      return [e.ref, e.brandName, e.contactName, e.phone, e.email, e.instagram].some((v) => (v || '').toLowerCase().includes(needle));
    });
  }, [enquiries, q, status, category, followOnly, today]);

  const current = selected ? enquiries.find((e) => e.ref === selected) : null;

  return (
    <section aria-labelledby="enq-title">
      <div className={a.panelHead}>
        <h2 id="enq-title">Vendor enquiries</h2>
        {role === 'admin' && (
          <a className="btn btn-outline btn-sm" href="/api/admin/enquiries?format=csv">
            <Icon name="download" /> Export CSV
          </a>
        )}
      </div>

      <div className={a.toolbar}>
        <label className={a.search}>
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search enquiries</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, name, phone, email, ref…" className={a.input} />
        </label>
        <label>
          <span className="visually-hidden">Filter by status</span>
          <select className={a.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            {ENQUIRY_STATUS_KEYS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="visually-hidden">Filter by category</span>
          <select className={a.input} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className={a.toggle}>
          <input type="checkbox" checked={followOnly} onChange={(e) => setFollowOnly(e.target.checked)} /> Follow-ups due
        </label>
      </div>

      <p className={a.muted} aria-live="polite">
        {loading ? 'Loading…' : `${list.length} of ${enquiries.length} enquiries`}
      </p>

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>Ref</th>
              <th>Brand</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={7}>
                    <div className="skeleton" style={{ height: 20 }} />
                  </td>
                </tr>
              ))}
            {!loading &&
              list.map((e) => {
                const due = e.followUpDate && e.followUpDate <= today && OPEN_STATUSES.includes(e.status);
                return (
                  <tr key={e.ref}>
                    <td className={a.mono}>
                      <button className={a.rowBtn} onClick={() => setSelected(e.ref)}>
                        {e.ref}
                      </button>
                    </td>
                    <td>
                      <strong>{e.brandName}</strong>
                      {e.instagram && <div className={a.muted}>@{e.instagram}</div>}
                    </td>
                    <td>
                      {e.contactName}
                      <div className={a.muted}>{e.phone}</div>
                    </td>
                    <td>{e.category}</td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                    <td className={due ? a.due : ''}>{e.followUpDate ? fmtDate(e.followUpDate, false) : '—'}</td>
                    <td>{fmtDate(e.createdAt)}</td>
                  </tr>
                );
              })}
            {!loading && !list.length && (
              <tr>
                <td colSpan={7} className={a.empty}>
                  No enquiries match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {current && (
        <Drawer
          key={current.ref + current.updatedAt}
          enquiry={current}
          onClose={() => setSelected(null)}
          onSaved={(updated) => setEnquiries((list) => list.map((x) => (x.ref === updated.ref ? updated : x)))}
        />
      )}
    </section>
  );
}
