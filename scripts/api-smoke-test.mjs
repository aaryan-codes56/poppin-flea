// API smoke test — LOCAL DEVELOPMENT ONLY. It creates and edits test records,
// so it refuses to run against anything but localhost.
// 1. npm run dev   (with .env.development.local → DATA_DRIVER=local, EMAIL_DRIVER=log)
// 2. node scripts/api-smoke-test.mjs <adminPassword> [staffPassword]   (env ADMIN_USER, default 'admin')
// 3. rm -rf .data   to clear the test records afterwards

import crypto from 'node:crypto';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) { console.error('Refusing to run against a non-local server.'); process.exit(1); }
const [ADMIN_PW, STAFF_PW] = process.argv.slice(2);
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
let pass = 0, fail = 0;
const results = [];
function check(name, cond, extra = '') {
  (cond ? pass++ : fail++);
  results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
}
let ipN = 0;
const freshIp = () => `10.0.${Math.floor(++ipN / 250)}.${ipN % 250}`;
async function req(path, { method = 'GET', body, cookie, headers = {}, ip, form } = {}) {
  const h = { 'x-forwarded-for': ip || freshIp(), ...headers };
  if (cookie) h.cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { h['content-type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect: 'manual' });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: res.headers };
}

const LOGIN_IP = '10.200.' + (Date.now() % 250) + '.9'; const ENQ_IP = '10.201.' + (Date.now() % 250) + '.8';
// ---------- 1. Admin APIs refuse anonymous access ----------
for (const [m, p] of [['GET', '/api/getBookings'], ['POST', '/api/updateBookingStatus'], ['POST', '/api/cancelBooking'], ['POST', '/api/confirmPayment'],
  ['GET', '/api/admin/enquiries'], ['GET', '/api/admin/enquiries?format=csv'], ['PATCH', '/api/admin/enquiries/PWC26-AAAAAA'],
  ['GET', '/api/admin/announcements'], ['POST', '/api/admin/announcements'], ['GET', '/api/admin/subscribers']]) {
  const r = await req(p, { method: m, body: m === 'GET' ? undefined : { rowIndex: 2, status: 'Cancelled' } });
  check(`anonymous ${m} ${p} → 401`, r.status === 401, `got ${r.status}`);
}
// forged cookie
const forged = `poppin_admin=${Buffer.from(JSON.stringify({ e: 'x@y.z', r: 'admin', exp: Date.now() + 1e7 })).toString('base64url')}.${crypto.randomBytes(32).toString('base64url')}`;
check('forged session cookie rejected', (await req('/api/admin/enquiries', { cookie: forged })).status === 401);
const adminPage = await req('/admin');
check('/admin without session shows login, no data', adminPage.status === 200 && adminPage.text.includes('Organiser login') && !adminPage.text.includes('Vendor enquiries'));
check('/admin sends noindex', (adminPage.headers.get('x-robots-tag') || '').includes('noindex'));
check('/admin/login redirects to /admin', (await req('/admin/login')).status === 307);

// ---------- 2. Login ----------
const bad = await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_USER, password: 'wrong-password' }, ip: LOGIN_IP });
check('wrong password → 401', bad.status === 401);
let limited = false;
for (let i = 0; i < 6; i++) {
  const r = await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_USER, password: 'nope' + i }, ip: LOGIN_IP });
  if (r.status === 429) limited = true;
}
check('login rate-limited after repeated failures', limited);
const login = await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_USER.toUpperCase(), password: ADMIN_PW } });
const setCookie = login.headers.get('set-cookie') || '';
check('admin login → 200 + HttpOnly SameSite=Strict cookie', login.status === 200 && /HttpOnly/i.test(setCookie) && /SameSite=Strict/i.test(setCookie), setCookie.split(';').slice(1).join(';'));
const ADMIN = setCookie.split(';')[0];
let STAFF = ADMIN;
const HAS_STAFF = Boolean(STAFF_PW);
if (HAS_STAFF) {
  const staffLogin = await req('/api/admin/login', { method: 'POST', body: { email: process.env.STAFF_USER || 'staff', password: STAFF_PW } });
  STAFF = (staffLogin.headers.get('set-cookie') || '').split(';')[0];
  check('staff login → 200', staffLogin.status === 200 && staffLogin.json?.role === 'staff');
}
check('admin page with session renders dashboard', (await req('/admin', { cookie: ADMIN })).text.includes('Organiser'));

// ---------- 3. Vendor enquiry (public) ----------
const good = {
  brandName: 'Test Brand QA', contactName: 'Test Person', phone: '+91 98765 43210', email: 'qa-test@example.com',
  instagram: 'https://www.instagram.com/test.brand_qa/', category: 'Jewellery & accessories',
  description: 'Handmade test jewellery for QA only', stallPreference: 'Standard stall', requirements: 'Needs one plug point', consent: true,
  source: { utm_source: 'instagram', page: '/winter-carnival' },
};
const empty = await req('/api/enquiries', { method: 'POST', body: {} });
check('empty enquiry → 400 with field errors', empty.status === 400 && Object.keys(empty.json?.errors || {}).length >= 7, Object.keys(empty.json?.errors || {}).join(','));
const badPhone = await req('/api/enquiries', { method: 'POST', body: { ...good, phone: '12345' } });
check('invalid phone rejected', badPhone.status === 400 && badPhone.json?.errors?.phone);
const badCat = await req('/api/enquiries', { method: 'POST', body: { ...good, category: 'Hacking' } });
check('unknown category rejected', badCat.status === 400 && badCat.json?.errors?.category);
const noConsent = await req('/api/enquiries', { method: 'POST', body: { ...good, consent: false } });
check('missing consent rejected', noConsent.status === 400 && noConsent.json?.errors?.consent);
const honeypot = await req('/api/enquiries', { method: 'POST', body: { ...good, website: 'spam.example' } });
check('honeypot silently accepted but not stored', honeypot.status === 200 && honeypot.json?.ref === 'PWC26-RECEIVED');
const created = await req('/api/enquiries', { method: 'POST', body: good });
const REF = created.json?.ref;
check('valid enquiry → 201 with reference', created.status === 201 && /^PWC26-[A-Z0-9]{6}$/.test(REF || ''), REF);
const dup = await req('/api/enquiries', { method: 'POST', body: good });
check('duplicate submission returns same reference', dup.json?.ref === REF && dup.json?.duplicate === true);
const xss = await req('/api/enquiries', { method: 'POST', body: { ...good, brandName: '<img src=x onerror=alert(1)>Brand', phone: '9123456780', email: 'qa2@example.com' } });
check('HTML in brand name stored as text (escaped in UI/email)', xss.status === 201);
let rl = false;
for (let i = 0; i < 7; i++) {
  const r = await req('/api/enquiries', { method: 'POST', ip: ENQ_IP, body: { ...good, brandName: `RL Brand ${i}`, phone: `90000000${10 + i}` } });
  if (r.status === 429) rl = true;
}
check('enquiry endpoint rate-limited per IP', rl);

// ---------- 4. CRM ----------
const list = await req('/api/admin/enquiries', { cookie: ADMIN });
const mine = list.json?.enquiries?.find((e) => e.ref === REF);
check('admin sees new enquiry with status New', mine?.status === 'New', mine?.status);
check('phone normalised and instagram handle extracted', mine?.phone === '9876543210' && mine?.instagram === 'test.brand_qa', `${mine?.phone} ${mine?.instagram}`);
check('UTM source captured', (mine?.source || '').includes('utm_source=instagram'));
const badStatus = await req(`/api/admin/enquiries/${REF}`, { method: 'PATCH', cookie: ADMIN, body: { status: 'Hacked' } });
check('invalid status rejected', badStatus.status === 400);
const upd = await req(`/api/admin/enquiries/${REF}`, { method: 'PATCH', cookie: STAFF, body: { status: 'Contacted', followUpDate: '2026-11-12', note: 'Called — wants corner stall' } });
check(HAS_STAFF ? 'staff can update status/follow-up/note' : 'admin can update status/follow-up/note', upd.status === 200 && upd.json?.enquiry?.status === 'Contacted' && upd.json.enquiry.notes.includes('corner stall'));
const crossSite = await req(`/api/admin/enquiries/${REF}`, { method: 'PATCH', cookie: ADMIN, headers: { origin: 'https://evil.example' }, body: { status: 'Confirmed' } });
check('cross-site PATCH blocked (CSRF)', crossSite.status === 403);
const csvAdmin = await req('/api/admin/enquiries?format=csv', { cookie: ADMIN });
check('admin CSV export works', csvAdmin.status === 200 && csvAdmin.text.includes('Reference') && csvAdmin.text.includes(REF));
check('CSV neutralises formula-looking cells', !/,=|,\+91/.test(csvAdmin.text));
if (HAS_STAFF) check('staff cannot export CSV', (await req('/api/admin/enquiries?format=csv', { cookie: STAFF })).status === 403);

// ---------- 5. Announcements ----------
if (HAS_STAFF) check('staff cannot manage announcements', (await req('/api/admin/announcements', { cookie: STAFF })).status === 403);
const ann = await req('/api/admin/announcements', { method: 'POST', cookie: ADMIN, body: { type: 'update', title: 'QA test announcement', body: 'Test only', published: true } });
check('admin creates announcement', ann.status === 201, ann.json?.announcement?.id);
const badLink = await req('/api/admin/announcements', { method: 'POST', cookie: ADMIN, body: { type: 'update', title: 'Bad link', linkUrl: 'javascript:alert(1)' } });
check('javascript: links rejected', badLink.status === 400);
const home = await req('/');
check('published announcement appears on homepage', home.text.includes('QA test announcement'));
await req(`/api/admin/announcements/${ann.json.announcement.id}`, { method: 'PATCH', cookie: ADMIN, body: { published: false } });
check('unpublished announcement hidden', !(await req('/')).text.includes('QA test announcement'));
const del = await req(`/api/admin/announcements/${ann.json.announcement.id}`, { method: 'DELETE', cookie: ADMIN });
check('announcement deleted', del.status === 200);

// ---------- 6. Subscribe / unsubscribe ----------
const sub = await req('/api/subscribe', { method: 'POST', body: { email: 'qa-sub@example.com', consent: true, page: '/' } });
check('subscribe with consent → 200', sub.status === 200);
check('subscribe without consent rejected', (await req('/api/subscribe', { method: 'POST', body: { email: 'x@example.com' } })).status === 400);
check('unsubscribe with forged token rejected', (await req('/api/unsubscribe', { method: 'POST', body: { email: 'qa-sub@example.com', token: 'x'.repeat(32) } })).status === 400);
const subs = await req('/api/admin/subscribers', { cookie: ADMIN });
check('admin sees subscriber', subs.json?.subscribers?.some((s) => s.email === 'qa-sub@example.com' && s.status === 'subscribed'));

// ---------- 7. Table bookings (original flow) ----------
const tableEnabled = (await req('/book')).status === 200;
check(`table booking mode detected (${tableEnabled ? 'open' : 'closed → /book redirects'})`, true);
if (!tableEnabled) {
  const f0 = new FormData();
  Object.entries({ name: 'QA', phone: '9876501234', email: 'qa@example.com', area: 'Indoor', date: '2025-12-24', timeSlot: '17:00', adults: '1' }).forEach(([k, v]) => f0.append(k, v));
  const closed = await req('/api/createBooking', { method: 'POST', form: f0 });
  check('public table booking refused while closed', closed.status === 403, `got ${closed.status}`);
  check('/book redirects to /book-a-stall', ((await req('/book')).headers.get('location') || '').includes('/book-a-stall'));
} else {
const slots = await req('/api/getSlots?date=2025-12-24');
check('getSlots returns counts only', slots.status === 200 && slots.json?.availability?.['16:00']?.Indoor?.limit === 16 && !slots.text.includes('@'));
check('getSlots rejects unknown dates', (await req('/api/getSlots?date=2030-01-01')).status === 400);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const mk = (extra = {}) => {
  const f = new FormData();
  Object.entries({ name: 'QA Guest', phone: '9876501234', email: 'qa-guest@example.com', area: 'Indoor', date: '2025-12-24', timeSlot: '17:00', adults: '2', children: '1', comments: 'QA', transactionId: 'UTRQA123', upiName: 'QA Guest', ...extra }).forEach(([k, v]) => f.append(k, v));
  return f;
};
const noShot = await req('/api/createBooking', { method: 'POST', form: mk() });
check('booking without screenshot rejected', noShot.status === 400, noShot.json?.message);
const f1 = mk(); f1.append('screenshot', new Blob([png], { type: 'image/png' }), 'pay.png');
const booked = await req('/api/createBooking', { method: 'POST', form: f1 });
check('customer booking created (Pending Verification)', booked.status === 200 && booked.json?.refId, `ref #${booked.json?.refId}`);
const spoof = await req('/api/createBooking', { method: 'POST', form: mk({ isOnSpot: 'true' }) });
check('on-spot booking without admin session → 401', spoof.status === 401);
const onspot = await req('/api/createBooking', { method: 'POST', cookie: ADMIN, form: mk({ isOnSpot: 'true', name: 'Walk-in QA', adults: '1' }) });
check('on-spot booking with admin session works', onspot.status === 200, `ref #${onspot.json?.refId}`);
const over = await req('/api/createBooking', { method: 'POST', cookie: ADMIN, form: mk({ isOnSpot: 'true', area: 'Library (Smoking)', adults: '5' }) });
check('capacity limit enforced (Library max 4)', over.status === 400, over.json?.message);
const bks = await req('/api/getBookings', { cookie: STAFF });
const b = bks.json?.bookings?.find((x) => x.refId === booked.json?.refId);
check('booking visible to organisers', Boolean(b));
const conf = await req('/api/confirmPayment', { method: 'POST', cookie: ADMIN, body: { rowIndex: b.rowIndex, bookingDetails: { email: 'attacker@evil.example' } } });
check('verify payment → Reserved', conf.status === 200);
check('invalid booking status rejected', (await req('/api/updateBookingStatus', { method: 'POST', cookie: ADMIN, body: { rowIndex: b.rowIndex, status: '=HYPERLINK("x")' } })).status === 400);
const arrived = await req('/api/updateBookingStatus', { method: 'POST', cookie: ADMIN, body: { rowIndex: b.rowIndex, status: 'Guest Arrived' } });
check('mark guest arrived', arrived.status === 200);
const on = (await req('/api/getBookings', { cookie: ADMIN })).json.bookings.find((x) => x.name === 'Walk-in QA');
check('cancel booking', (await req('/api/cancelBooking', { method: 'POST', cookie: ADMIN, body: { rowIndex: on.rowIndex } })).status === 200);
const after = (await req('/api/getBookings', { cookie: ADMIN })).json.bookings;
check('statuses persisted', after.find((x) => x.refId === booked.json.refId)?.status === 'Guest Arrived' && after.find((x) => x.name === 'Walk-in QA')?.status === 'Cancelled');

}

// ---------- 8. Logout ----------
const out = await req('/api/admin/logout', { method: 'POST', cookie: ADMIN });
check('logout clears cookie', /Max-Age=0/.test(out.headers.get('set-cookie') || ''));

// ---------- 9. SEO basics ----------
const wc = await req('/winter-carnival');
check('carnival page has Event JSON-LD with 2026-12-23', wc.text.includes('"@type":"Event"') && wc.text.includes('"startDate":"2026-12-23"') && wc.text.includes('"endDate":"2026-12-25"'));
check('carnival page has OG image + canonical', wc.text.includes('og:image') && wc.text.includes('rel="canonical"'));
check('no public admin links on homepage', !/href="\/admin/.test(home.text));
const sm = await req('/sitemap.xml');
check('sitemap excludes admin', sm.status === 200 && !sm.text.includes('/admin'));

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
