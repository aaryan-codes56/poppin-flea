import { useEffect, useState } from 'react';
import { WINTER_CARNIVAL as E } from '@/lib/config/event';
import styles from './ui.module.css';

const START = Date.parse(E.startsAt);
const END = Date.parse(E.endsAt);

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function eventPhase(now) {
  if (now < START) return 'upcoming';
  if (now < END) return 'live';
  return 'ended';
}

// Counts down to 00:00 IST on 23 Dec 2026. Server renders placeholders so the
// first client render matches; the real numbers appear after hydration.
export default function Countdown({ tone = 'dark', compact = false, label = true }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = now === null ? 'upcoming' : eventPhase(now);

  if (phase === 'live') {
    return (
      <div className={`${styles.countdownMessage} ${styles[`cd_${tone}`]}`} role="status">
        <span className="live-dot" aria-hidden="true" /> The Winter Carnival is happening now — see you in Patna!
      </div>
    );
  }
  if (phase === 'ended') {
    return (
      <div className={`${styles.countdownMessage} ${styles[`cd_${tone}`]}`} role="status">
        That’s a wrap on {E.fullName}. Thank you, Patna! Follow @poppinflea for what’s next.
      </div>
    );
  }

  const p = now === null ? null : parts(START - now);
  const units = [
    ['days', 'Days'],
    ['hours', 'Hours'],
    ['minutes', 'Minutes'],
    ['seconds', 'Seconds'],
  ];
  const summary = p ? `${p.days} days, ${p.hours} hours and ${p.minutes} minutes to go` : 'Countdown loading';

  return (
    <div className={`${styles.countdown} ${styles[`cd_${tone}`]} ${compact ? styles.cdCompact : ''}`}>
      {label && <p className={styles.cdLabel}>Countdown to 23 December · IST</p>}
      <div className={styles.cdGrid} role="timer" aria-label={summary} aria-live="off">
        {units.map(([key, text]) => (
          <div key={key} className={styles.cdUnit} aria-hidden="true">
            <span className={styles.cdValueWrap}>
              <span key={p ? p[key] : 'x'} className={`${styles.cdValue} ${p ? styles.cdTick : ''} tabular`}>
                {p ? String(p[key]).padStart(2, '0') : '––'}
              </span>
            </span>
            <span className={styles.cdText}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
