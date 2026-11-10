import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import styles from './instagram.module.css';

const EMBED_SRC = 'https://www.instagram.com/embed.js';
let scriptPromise = null;

function loadEmbedScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.instgrm) return Promise.resolve(window.instgrm);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = EMBED_SRC;
      s.async = true;
      s.onload = () => resolve(window.instgrm || null);
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

function fmt(date) {
  return new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Official Instagram embeds in a swipeable carousel. Nothing is requested from
// Instagram until the carousel scrolls into view. If embeds are blocked, each
// card still links to the post.
export default function InstagramCarousel({ posts }) {
  const wrap = useRef(null);
  const track = useRef(null);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadEmbedScript().then((ig) => {
      if (cancelled) return;
      if (ig) ig.Embeds.process();
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const onScroll = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  }, []);

  const scrollBy = (dir) => {
    const t = track.current;
    if (!t) return;
    t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.85, 720), behavior: 'smooth' });
  };

  return (
    <div className={styles.wrap} ref={wrap}>
      <div className={styles.controls}>
        <button type="button" className={styles.navBtn} onClick={() => scrollBy(-1)} disabled={edges.start} aria-label="Previous posts">
          <Icon name="chevronLeft" size={22} />
        </button>
        <button type="button" className={styles.navBtn} onClick={() => scrollBy(1)} disabled={edges.end} aria-label="Next posts">
          <Icon name="chevronRight" size={22} />
        </button>
      </div>
      <ul className={styles.track} ref={track} onScroll={onScroll} aria-label="Poppin on Instagram">
        {posts.map((p, i) => (
          <li key={p.url} className={styles.card} style={{ '--i': i }}>
            <div className={styles.meta}>
              <span className={styles.kind}>
                <Icon name={p.kind === 'reel' ? 'sparkle' : 'instagram'} size={14} /> {p.kind === 'reel' ? 'Reel' : 'Post'}
              </span>
              <span>
                @{p.by} · {fmt(p.date)}
              </span>
            </div>
            <div className={styles.frame}>
              {active && !failed ? (
                // embed.js replaces this blockquote with an iframe, so React must not manage its children.
                <div
                  className={styles.embed}
                  dangerouslySetInnerHTML={{
                    __html: `<blockquote class="instagram-media" data-instgrm-permalink="${p.url}?utm_source=ig_embed" data-instgrm-version="14" style="background:#fff;border:0;margin:0;min-width:300px;width:100%;"></blockquote>`,
                  }}
                />
              ) : (
                <div className={styles.placeholder} aria-hidden="true">
                  <Icon name="instagram" size={36} />
                  <span>{failed ? 'Open on Instagram' : 'Loading from Instagram…'}</span>
                </div>
              )}
            </div>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.open}>
              {p.kind === 'reel' ? 'Watch' : 'View'} on Instagram <Icon name="arrowUpRight" size={15} />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
