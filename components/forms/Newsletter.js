import { useState } from 'react';
import Link from 'next/link';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';
import { track } from '@/lib/analytics';
import f from './forms.module.css';

export default function Newsletter() {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    if (state.status === 'loading') return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.consent) {
      setState({ status: 'error', message: 'Please tick the box to agree to receive updates.' });
      return;
    }
    setState({ status: 'loading', message: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, consent: true, page: window.location.pathname }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Something went wrong.');
      track('subscribe');
      setState({ status: 'done', message: 'You’re on the list! Check your inbox for a confirmation.' });
      e.target.reset();
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <section className={`section ${f.newsletterSection}`} aria-labelledby="news-title">
      <div className="container">
        <Reveal className={f.newsletter}>
          <div>
            <p className="eyebrow">Event updates</p>
            <h2 id="news-title" className={f.newsTitle}>
              Be first to hear the <span className="display-italic">venue reveal.</span>
            </h2>
            <p className="muted">Occasional emails about Poppin events. No spam, unsubscribe in one click.</p>
          </div>
          {state.status === 'done' ? (
            <p className={f.newsDone} role="status">
              <Icon name="check" size={22} /> {state.message}
            </p>
          ) : (
            <form className={f.newsForm} onSubmit={onSubmit} noValidate>
              <div className={f.newsRow}>
                <label htmlFor="news-email" className="visually-hidden">
                  Email address
                </label>
                <input id="news-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={f.input} />
                <button type="submit" className="btn btn-burgundy" disabled={state.status === 'loading'}>
                  {state.status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className={f.honeypot} aria-hidden="true" />
              <label className={f.check}>
                <input type="checkbox" name="consent" value="true" required />
                <span>
                  I agree to receive Poppin event updates by email. See our{' '}
                  <Link href="/privacy" className="link">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {state.status === 'error' && (
                <p className={f.errorText} role="alert">
                  {state.message}
                </p>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
