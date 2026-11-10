import Reveal from './Reveal';
import styles from './ui.module.css';

export default function SectionHeading({ eyebrow, title, intro, align = 'left', as: H = 'h2', id, children }) {
  return (
    <Reveal className={`${styles.heading} ${align === 'center' ? styles.center : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <H id={id} className={styles.headingTitle}>
        {title}
      </H>
      {intro && <p className={`lead ${styles.headingIntro}`}>{intro}</p>}
      {children}
    </Reveal>
  );
}
