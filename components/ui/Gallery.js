import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from './Icon';
import Reveal from './Reveal';
import styles from './ui.module.css';

// Masonry gallery with an accessible lightbox (Esc, ←/→, focus return).
export default function Gallery({ items }) {
  const [index, setIndex] = useState(-1);
  const lastTrigger = useRef(null);
  const closeBtn = useRef(null);
  const open = index >= 0;

  const close = useCallback(() => {
    setIndex(-1);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);
  const step = useCallback((d) => setIndex((i) => (i + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        const nodes = document.querySelectorAll('[data-lightbox] button');
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const current = open ? items[index] : null;

  return (
    <>
      <ul className={styles.masonry}>
        {items.map((item, i) => (
          <Reveal as="li" key={item.src} delay={(i % 3) * 80} className={styles.masonryItem}>
            <button
              type="button"
              className={styles.galleryBtn}
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setIndex(i);
              }}
              aria-label={`Open ${item.video ? 'video' : 'photo'}: ${item.caption}`}
            >
              {item.video ? (
                <video
                  src={item.video}
                  poster={item.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  width={item.width}
                  height={item.height}
                  className={styles.galleryImg}
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes="(max-width: 600px) 92vw, (max-width: 1024px) 46vw, 30vw"
                  className={styles.galleryImg}
                />
              )}
              {item.video && (
                <span className={styles.playBadge} aria-hidden="true">
                  ▶
                </span>
              )}
              <span className={styles.galleryCaption}>{item.caption}</span>
            </button>
          </Reveal>
        ))}
      </ul>

      {current && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={current.caption} data-lightbox="" onClick={close}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button ref={closeBtn} className={`${styles.lbBtn} ${styles.lbClose}`} onClick={close} aria-label="Close photo">
              <Icon name="close" size={22} />
            </button>
            <figure className={styles.lbFigure}>
              {current.video ? (
                <video key={current.video} src={current.video} poster={current.src} controls autoPlay playsInline className={styles.lbImg} />
              ) : (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="90vw"
                className={styles.lbImg}
                loading="eager"
              />
              )}
              <figcaption className={styles.lbCaption}>
                {current.caption}
                <span className={styles.lbCount}>
                  {index + 1} / {items.length}
                </span>
              </figcaption>
            </figure>
            {items.length > 1 && (
              <>
                <button className={`${styles.lbBtn} ${styles.lbPrev}`} onClick={() => step(-1)} aria-label="Previous photo">
                  <Icon name="chevronLeft" size={24} />
                </button>
                <button className={`${styles.lbBtn} ${styles.lbNext}`} onClick={() => step(1)} aria-label="Next photo">
                  <Icon name="chevronRight" size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
