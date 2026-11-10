import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import p from '@/styles/pages.module.css';

export default function Unsubscribe() {
  const { query, isReady } = useRouter();
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');

  async function confirm() {
    setState('loading');
    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: query.email, token: query.token }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setState('done');
    else {
      setState('error');
      setMsg(json.message || 'Something went wrong.');
    }
  }

  const valid = isReady && query.email && query.token;
  return (
    <Layout seo={{ title: 'Unsubscribe', noindex: true }}>
      <PageHeader eyebrow="Email preferences" title="Unsubscribe" />
      <section className="section bg-cream">
        <div className={`container-narrow ${p.legal}`} aria-live="polite">
          {!valid && <p>This link is incomplete. Please use the unsubscribe link from your email.</p>}
          {valid && state === 'done' && <p>You’ve been unsubscribed from Poppin updates. Sorry to see you go!</p>}
          {valid && state !== 'done' && (
            <>
              <p>
                Stop sending Poppin event updates to <strong>{query.email}</strong>?
              </p>
              <button className="btn btn-burgundy" onClick={confirm} disabled={state === 'loading'}>
                {state === 'loading' ? 'Unsubscribing…' : 'Yes, unsubscribe me'}
              </button>
              {state === 'error' && <p role="alert">{msg}</p>}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
