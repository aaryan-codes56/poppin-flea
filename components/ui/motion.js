// Small, dependency-free motion helpers. Everything here is skipped for
// people who prefer reduced motion and for touch-only devices where hover
// effects make no sense.
import { Fragment, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import styles from './motion.module.css';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function finePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

// ---------- Snowfall (CSS only, deterministic positions → no hydration mismatch) ----------
export function Snow({ count = 34 }) {
  const flakes = Array.from({ length: count }, (_, i) => {
    const r = (n) => ((i * 9301 + n * 49297) % 233280) / 233280; // stable pseudo-random
    return {
      left: `${(r(1) * 100).toFixed(2)}%`,
      size: `${(3 + r(2) * 5).toFixed(1)}px`,
      dur: `${(9 + r(3) * 10).toFixed(1)}s`,
      delay: `${(-r(4) * 18).toFixed(1)}s`,
      drift: `${((r(5) - 0.5) * 80).toFixed(0)}px`,
      opacity: (0.35 + r(6) * 0.5).toFixed(2),
    };
  });
  return (
    <div className={styles.snow} aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          style={{ left: f.left, width: f.size, height: f.size, animationDuration: f.dur, animationDelay: f.delay, '--drift': f.drift, opacity: f.opacity }}
        />
      ))}
    </div>
  );
}

// ---------- Word-by-word headline reveal ----------
// Keeps real text in the DOM (screen readers read it normally).
export function SplitWords({ children, delay = 0, step = 70 }) {
  let n = 0;
  const split = (node) => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part, i) => {
        if (/^\s+$/.test(part) || !part) return part;
        const d = delay + n++ * step;
        return (
          <span key={`${part}-${i}-${d}`} className={styles.word}>
            <span className={styles.wordInner} style={{ animationDelay: `${d}ms` }}>
              {part}
            </span>
          </span>
        );
      });
    }
    if (isValidElement(node) && node.props.children !== undefined) {
      return cloneElement(node, undefined, ...[].concat(node.props.children).map((c, i) => <Fragment key={i}>{split(c)}</Fragment>));
    }
    return node;
  };
  return <>{[].concat(children).map((c, i) => <Fragment key={i}>{split(c)}</Fragment>)}</>;
}

// ---------- Pointer parallax: sets --px / --py (-1…1) on the element ----------
export function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !finePointer()) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', Math.max(-1, Math.min(1, x)).toFixed(3));
        el.style.setProperty('--py', Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    const reset = () => {
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };
    const host = el.closest('section') || el;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', reset);
    };
  }, []);
  return ref;
}

// ---------- 3D tilt on hover ----------
export function useTilt(max = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !finePointer()) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-4px)`;
        el.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    };
  }, [max]);
  return ref;
}

// ---------- Count up when scrolled into view ----------
export function CountUp({ to, duration = 1400, suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(to); // SSR / no-JS shows the real number
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setValue(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / duration);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return (
    <span ref={ref} className="tabular">
      {value}
      {suffix}
    </span>
  );
}

// ---------- Scroll progress bar ----------
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div ref={ref} className={styles.progress} aria-hidden="true" />;
}

// ---------- Confetti burst (canvas, ~1.8s, brand colours) ----------
export function confetti({ x = 0.5, y = 0.35, count = 140 } = {}) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = styles.confetti;
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const colors = ['#f4d92f', '#d0283b', '#4fc3c5', '#e3c987', '#3e6b52', '#fbf6ec'];
  const parts = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = 6 + Math.random() * 9;
    return {
      x: innerWidth * x, y: innerHeight * y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0],
    };
  });
  const t0 = performance.now();
  const frame = (t) => {
    const age = t - t0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - age / 1800);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    if (age < 1800) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

// Wrapper that applies useTilt + the global .tilt glare styles.
export function TiltBox({ as: Tag = 'div', className = '', max = 6, children, ...rest }) {
  const ref = useTilt(max);
  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
