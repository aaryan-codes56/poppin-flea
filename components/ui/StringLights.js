import styles from './ui.module.css';

// Decorative festive bulbs on a drooping wire. CSS-only twinkle, paused for
// reduced motion. Purely decorative, hidden from assistive tech.
const COLORS = ['#f4d92f', '#d0283b', '#4fc3c5', '#e3c987', '#f4d92f', '#3e6b52'];

export default function StringLights({ count = 22, className = '' }) {
  const width = 1200;
  const bulbs = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const x = t * width;
    const sag = 34 * Math.sin(Math.PI * ((t * 3) % 1)); // three swags
    return { x: Math.round(x * 100) / 100, y: Math.round((10 + sag) * 100) / 100, color: COLORS[i % COLORS.length], delay: (i * 370) % 2600 };
  });
  const wire = Array.from({ length: 61 }, (_, i) => {
    const t = i / 60;
    return `${i ? 'L' : 'M'}${(t * width).toFixed(1)} ${(10 + 34 * Math.sin(Math.PI * ((t * 3) % 1)) - 4).toFixed(1)}`;
  }).join(' ');

  return (
    <svg className={`${styles.lights} ${className}`} viewBox={`0 0 ${width} 70`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={wire} fill="none" stroke="rgba(227,201,135,0.35)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {bulbs.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <rect x="-2.2" y="-6" width="4.4" height="5" rx="1" fill="rgba(227,201,135,0.55)" />
          <ellipse
            className={styles.bulb}
            style={{ animationDelay: `${b.delay}ms`, color: b.color }}
            cx="0"
            cy="4"
            rx="4.2"
            ry="6"
            fill="currentColor"
          />
        </g>
      ))}
    </svg>
  );
}
