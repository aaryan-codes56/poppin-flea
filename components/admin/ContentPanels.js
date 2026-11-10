import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { api, fmtDate } from './api';
import { ANNOUNCEMENT_TYPES } from '@/lib/config/crm';
import a from './admin.module.css';

const BLANK = { type: 'update', title: '', body: '', linkUrl: '', linkLabel: '', published: false, pinned: false };

// Announcements shown on the homepage and /winter-carnival. Only published
// items are public. Pages refresh within ~2 minutes of a change.
export function AnnouncementsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { announcements } = await api('/api/admin/announcements');
      setItems(announcements);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api(`/api/admin/announcements/${editing}`, { method: 'PATCH', body: form });
      else await api('/api/admin/announcements', { method: 'POST', body: form });
      setForm(BLANK);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  async function patch(id, body) {
    try {
      await api(`/api/admin/announcements/${id}`, { method: 'PATCH', body });
      load();
    } catch (err) {
      alert(err.message);
    }
  }
  async function remove(id) {
    if (!confirm('Delete this announcement permanently?')) return;
    try {
      await api(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <section aria-labelledby="ann-title">
      <div className={a.panelHead}>
        <div>
          <h2 id="ann-title">Announcements</h2>
          <p className={a.muted}>Venue reveal, vendor and partner news, visitor info. Only published items appear on the site.</p>
        </div>
      </div>

      <form className={a.annForm} onSubmit={save}>
        <h3>{editing ? 'Edit announcement' : 'New announcement'}</h3>
        <div className={a.row2}>
          <label className={a.label}>
            Type
            <select className={a.input} name="type" value={form.type} onChange={set}>
              {ANNOUNCEMENT_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className={a.label}>
            Title
            <input className={a.input} name="title" value={form.title} onChange={set} required maxLength={120} placeholder="e.g. Venue revealed!" />
          </label>
        </div>
        <label className={a.label}>
          Details
          <textarea className={a.input} name="body" rows={3} value={form.body} onChange={set} maxLength={800} />
        </label>
        <div className={a.row2}>
          <label className={a.label}>
            Link (optional)
            <input className={a.input} name="linkUrl" value={form.linkUrl} onChange={set} placeholder="https://… or /winter-carnival" />
          </label>
          <label className={a.label}>
            Link text
            <input className={a.input} name="linkLabel" value={form.linkLabel} onChange={set} maxLength={40} placeholder="Learn more" />
          </label>
        </div>
        <div className={a.checks}>
          <label className={a.toggle}>
            <input type="checkbox" name="published" checked={form.published} onChange={set} /> Publish on the website
          </label>
          <label className={a.toggle}>
            <input type="checkbox" name="pinned" checked={form.pinned} onChange={set} /> Pin to top
          </label>
        </div>
        {error && <p className={a.error}>{error}</p>}
        <div className="btn-row">
          <button className="btn btn-primary btn-sm">{editing ? 'Save changes' : 'Create'}</button>
          {editing && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setEditing(null);
                setForm(BLANK);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="skeleton" style={{ height: 80 }} />
      ) : (
        <ul className={a.annList}>
          {items.map((x) => (
            <li key={x.id} className={a.annItem}>
              <div>
                <p className={a.muted}>
                  {ANNOUNCEMENT_TYPES.find((t) => t.key === x.type)?.label} · {fmtDate(x.createdAt)}
                  {x.pinned === 'TRUE' && ' · 📌 Pinned'}
                </p>
                <h4>{x.title}</h4>
                {x.body && <p>{x.body}</p>}
              </div>
              <div className={a.annActions}>
                <span className={`${a.badge} ${x.published === 'TRUE' ? a.tone_good : a.tone_neutral}`}>{x.published === 'TRUE' ? 'Live' : 'Draft'}</span>
                <button className={a.actBtn} onClick={() => patch(x.id, { published: x.published !== 'TRUE' })}>
                  {x.published === 'TRUE' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  className={a.actBtn}
                  onClick={() => {
                    setEditing(x.id);
                    setForm({ ...x, published: x.published === 'TRUE', pinned: x.pinned === 'TRUE' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
                <button className={`${a.actBtn} ${a.actCancel}`} onClick={() => remove(x.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
          {!items.length && <li className={a.empty}>No announcements yet.</li>}
        </ul>
      )}
    </section>
  );
}

export function SubscribersPanel() {
  const [subs, setSubs] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/api/admin/subscribers')
      .then((d) => setSubs(d.subscribers))
      .catch((e) => setError(e.message));
  }, []);
  const active = (subs || []).filter((s) => s.status === 'subscribed');
  return (
    <section aria-labelledby="sub-title">
      <div className={a.panelHead}>
        <div>
          <h2 id="sub-title">Update subscribers</h2>
          <p className={a.muted}>{subs ? `${active.length} subscribed · ${subs.length - active.length} unsubscribed` : 'Loading…'}</p>
        </div>
        <a className="btn btn-outline btn-sm" href="/api/admin/subscribers?format=csv">
          <Icon name="download" /> Export active (CSV)
        </a>
      </div>
      {error && <p className={a.error}>{error}</p>}
      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Page</th>
            </tr>
          </thead>
          <tbody>
            {(subs || []).map((s) => (
              <tr key={s.email}>
                <td>{s.email}</td>
                <td>{s.name || '—'}</td>
                <td>
                  <span className={`${a.badge} ${s.status === 'subscribed' ? a.tone_good : a.tone_neutral}`}>{s.status}</span>
                </td>
                <td>{fmtDate(s.createdAt)}</td>
                <td>{s.source || '—'}</td>
              </tr>
            ))}
            {subs && !subs.length && (
              <tr>
                <td colSpan={5} className={a.empty}>
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
