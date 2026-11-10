import { useState } from 'react';
import Image from 'next/image';
import a from './admin.module.css';

export default function AdminLogin({ configured }) {
  const [state, setState] = useState({ loading: false, error: '' });

  async function onSubmit(e) {
    e.preventDefault();
    setState({ loading: true, error: '' });
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Login failed');
      window.location.reload();
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }

  return (
    <div className={a.loginWrap}>
      <form className={a.loginCard} onSubmit={onSubmit}>
        <Image src="/brand/poppin-logo.png" alt="Poppin" width={640} height={292} className={a.loginLogo} preload />
        <h1>Organiser login</h1>
        {!configured && (
          <p className={a.warn} role="alert">
            Admin login isn’t configured on this server yet. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET (see README).
          </p>
        )}
        <label className={a.label} htmlFor="email">
          Username
        </label>
        <input id="email" name="email" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required className={a.input} />
        <label className={a.label} htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={a.input} />
        {state.error && (
          <p className={a.error} role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="btn btn-burgundy" disabled={state.loading || !configured}>
          {state.loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
