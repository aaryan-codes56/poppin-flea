// Organiser dashboard. Reachable only by typing /admin — nothing public links here.
// The session is checked on the server before any data is sent, and every
// admin API checks it again independently.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import AdminLogin from '@/components/admin/AdminLogin';
import EnquiriesPanel from '@/components/admin/EnquiriesPanel';
import BookingsPanel from '@/components/admin/BookingsPanel';
import { AnnouncementsPanel, SubscribersPanel } from '@/components/admin/ContentPanels';
import Icon from '@/components/ui/Icon';
import { api, todayIST } from '@/components/admin/api';
import { OPEN_STATUSES } from '@/lib/config/crm';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import { WINTER_CARNIVAL as E } from '@/lib/config/event';
import { getSession, authConfigured } from '@/lib/server/auth';
import a from '@/components/admin/admin.module.css';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'sparkle' },
  { key: 'enquiries', label: 'Vendor enquiries', icon: 'store' },
  { key: 'bookings', label: 'Table bookings', icon: 'ticket', hidden: !TABLE_BOOKING.enabled },
  { key: 'announcements', label: 'Announcements', icon: 'megaphone', adminOnly: true },
  { key: 'subscribers', label: 'Subscribers', icon: 'mail', adminOnly: true },
];

function Stat({ label, value, hint, onClick, accent }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`${a.stat} ${accent ? a.statAccent : ''}`} onClick={onClick}>
      <span className={a.statLabel}>{label}</span>
      <span className={a.statValue}>{value}</span>
      {hint && <span className={a.statHint}>{hint}</span>}
    </Tag>
  );
}

function Breakdown({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className={a.card}>
      <h3>{title}</h3>
      {rows.length ? (
        <ul className={a.bars}>
          {rows.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span className={a.barTrack}>
                <span className={a.bar} style={{ width: `${(v / max) * 100}%` }} />
              </span>
              <strong>{v}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className={a.muted}>No data yet.</p>
      )}
    </div>
  );
}

function count(list, fn) {
  const m = new Map();
  list.forEach((x) => {
    const k = fn(x) || 'Direct / unknown';
    m.set(k, (m.get(k) || 0) + 1);
  });
  return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6);
}

function Dashboard({ session }) {
  const [tab, setTab] = useState('overview');
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({ enq: true, bk: true });
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState(null);
  const isAdmin = session.role === 'admin';

  const loadEnquiries = useCallback(async () => {
    try {
      const d = await api('/api/admin/enquiries');
      setEnquiries(d.enquiries);
      setErrors((e) => ({ ...e, enq: null }));
    } catch (e) {
      setErrors((x) => ({ ...x, enq: e.message }));
    } finally {
      setLoading((l) => ({ ...l, enq: false }));
    }
  }, []);
  const loadBookings = useCallback(async () => {
    try {
      const d = await api('/api/getBookings');
      setBookings(d.bookings);
      setErrors((e) => ({ ...e, bk: null }));
    } catch (e) {
      setErrors((x) => ({ ...x, bk: e.message }));
    } finally {
      setLoading((l) => ({ ...l, bk: false }));
    }
  }, []);

  useEffect(() => {
    loadEnquiries();
    if (TABLE_BOOKING.enabled) loadBookings();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadEnquiries();
        if (TABLE_BOOKING.enabled) loadBookings();
      }
    }, 30000);
    return () => clearInterval(id);
  }, [loadEnquiries, loadBookings]);

  const stats = useMemo(() => {
    const today = todayIST();
    const by = (s) => enquiries.filter((e) => e.status === s).length;
    const confirmed = by('Confirmed');
    return {
      total: enquiries.length,
      new: by('New'),
      contacted: by('Contacted'),
      approved: by('Approved') + by('Payment Pending'),
      confirmed,
      followUps: enquiries.filter((e) => e.followUpDate && e.followUpDate <= today && OPEN_STATUSES.includes(e.status)).length,
      conversion: enquiries.length ? Math.round((confirmed / enquiries.length) * 100) : 0,
      bookingsActive: bookings.filter((b) => b.status !== 'Cancelled').length,
      bookingsPending: bookings.filter((b) => b.status === 'Pending Verification').length,
    };
  }, [enquiries, bookings]);

  const go = (t, f = null) => {
    setFilter(f);
    setTab(t);
  };

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className={a.shell}>
      <aside className={a.sidebar}>
        <Link href="/" className={a.sideBrand} aria-label="View public site">
          <Image src="/brand/poppin-logo.png" alt="Poppin" width={640} height={292} className={a.sideLogo} />
          <span>Organiser</span>
        </Link>
        <nav aria-label="Dashboard">
          <ul className={a.tabs}>
            {TABS.filter((t) => !t.hidden && (!t.adminOnly || isAdmin)).map((t) => (
              <li key={t.key}>
                <button className={a.tab} aria-current={tab === t.key ? 'page' : undefined} onClick={() => go(t.key)}>
                  <Icon name={t.icon} size={18} /> {t.label}
                  {t.key === 'enquiries' && stats.new > 0 && <span className={a.count}>{stats.new}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={a.sideFoot}>
          <p>
            {session.email}
            <br />
            <span className={a.role}>{session.role}</span>
          </p>
          <button className={a.tab} onClick={logout}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      </aside>

      <main className={a.main}>
        {tab === 'overview' && (
          <section aria-labelledby="ov-title">
            <div className={a.panelHead}>
              <div>
                <h1 id="ov-title">Overview</h1>
                <p className={a.muted}>
                  {E.fullName} · {E.dateLabel} · {E.locationLabel}
                </p>
              </div>
            </div>
            {errors.enq && <p className={a.error}>Vendor enquiries: {errors.enq}</p>}
            <div className={a.statGrid}>
              <Stat label="Total enquiries" value={stats.total} onClick={() => go('enquiries', { status: 'All' })} accent />
              <Stat label="New" value={stats.new} hint="Not yet contacted" onClick={() => go('enquiries', { status: 'New' })} />
              <Stat label="Contacted" value={stats.contacted} onClick={() => go('enquiries', { status: 'Contacted' })} />
              <Stat label="Approved" value={stats.approved} hint="incl. payment pending" onClick={() => go('enquiries', { status: 'Approved' })} />
              <Stat label="Confirmed stalls" value={stats.confirmed} hint={`${stats.conversion}% of enquiries`} onClick={() => go('enquiries', { status: 'Confirmed' })} />
              <Stat label="Follow-ups due" value={stats.followUps} hint="Today or overdue" onClick={() => go('enquiries', { followUps: true })} />
            </div>
            <div className={a.grid2}>
              <Breakdown title="Enquiries by category" rows={count(enquiries, (e) => e.category)} />
              <Breakdown
                title="Where vendors came from"
                rows={count(enquiries, (e) => {
                  const m = (e.source || '').match(/utm_source=([^ ·]+)/) || (e.source || '').match(/ref=([^ ·]+)/);
                  return m ? m[1] : null;
                })}
              />
            </div>
            {TABLE_BOOKING.enabled && (
              <div className={a.statGrid}>
                <Stat label="Table bookings (active)" value={loading.bk ? '…' : stats.bookingsActive} onClick={() => go('bookings')} />
                <Stat label="Payments to verify" value={loading.bk ? '…' : stats.bookingsPending} onClick={() => go('bookings')} />
              </div>
            )}
          </section>
        )}
        {tab === 'enquiries' && (
          <EnquiriesPanel enquiries={enquiries} setEnquiries={setEnquiries} role={session.role} loading={loading.enq} initialFilter={filter} />
        )}
        {tab === 'bookings' && TABLE_BOOKING.enabled && <BookingsPanel bookings={bookings} reload={loadBookings} loading={loading.bk} error={errors.bk} />}
        {tab === 'announcements' && isAdmin && <AnnouncementsPanel />}
        {tab === 'subscribers' && isAdmin && <SubscribersPanel />}
      </main>
    </div>
  );
}

export default function AdminPage({ session, configured }) {
  return (
    <>
      <Head>
        <title>Organiser dashboard | Poppin</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {session ? <Dashboard session={session} /> : <AdminLogin configured={configured} />}
    </>
  );
}

export function getServerSideProps({ req, res }) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return { props: { session: getSession(req), configured: authConfigured() } };
}
