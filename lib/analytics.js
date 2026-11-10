// Privacy-conscious analytics: cookieless Plausible events when
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, nothing otherwise. No personal data is
// ever sent — only event names and coarse labels.
//
// Events: cta_click, contact_click, enquiry_form_started, enquiry_submitted,
// enquiry_failed, subscribe, share. Form abandonment = started − submitted.

export function track(event, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.plausible === 'function') window.plausible(event, { props });
    else if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', event, props);
  } catch {
    /* never break the UI for analytics */
  }
}

// First-touch attribution kept in sessionStorage and attached to enquiries,
// so organisers can see which channel (e.g. Instagram) brought each vendor.
export function captureSource() {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem('poppin_src')) return;
    const p = new URLSearchParams(window.location.search);
    const src = {
      utm_source: p.get('utm_source') || '',
      utm_medium: p.get('utm_medium') || '',
      utm_campaign: p.get('utm_campaign') || '',
      referrer: document.referrer ? new URL(document.referrer).hostname : '',
      page: window.location.pathname,
    };
    sessionStorage.setItem('poppin_src', JSON.stringify(src));
  } catch {
    /* storage may be blocked */
  }
}

export function getSource() {
  try {
    return JSON.parse(sessionStorage.getItem('poppin_src') || '{}');
  } catch {
    return {};
  }
}
