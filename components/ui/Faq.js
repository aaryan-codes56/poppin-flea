import { useId, useState } from 'react';
import Icon from './Icon';
import styles from './ui.module.css';

// Accessible accordion (button + region). One item open at a time.
export default function Faq({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();
  return (
    <div className={styles.faq}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div key={item.q} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}>
            <h3 className={styles.faqQ}>
              <button id={btnId} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span className={styles.faqNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.faqText}>{item.q}</span>
                <Icon name="chevronDown" className={styles.faqIcon} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={styles.faqPanel} hidden={!isOpen}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
