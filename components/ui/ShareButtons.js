import { useEffect, useState } from 'react';
import Icon from './Icon';
import { SITE } from '@/lib/config/site';
import { track } from '@/lib/analytics';

// WhatsApp share, native share sheet (phones) and copy link.
export default function ShareButtons({ path = '/winter-carnival', text }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);
  const url = `${SITE.url}${path}?utm_source=share&utm_medium=social`;
  const message = `${text} ${url}`;

  async function nativeShare() {
    track('share', { method: 'native' });
    try {
      await navigator.share({ title: 'Poppin Winter Carnival 2026', text, url });
    } catch {
      /* user cancelled */
    }
  }
  async function copy() {
    track('share', { method: 'copy' });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <div className="btn-row">
      <a
        className="btn btn-whatsapp btn-sm"
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('share', { method: 'whatsapp' })}
      >
        <Icon name="whatsapp" /> Share on WhatsApp
      </a>
      {canShare && (
        <button type="button" className="btn btn-outline btn-sm" onClick={nativeShare}>
          <Icon name="share" /> Share
        </button>
      )}
      <button type="button" className="btn btn-outline btn-sm" onClick={copy} aria-live="polite">
        <Icon name={copied ? 'check' : 'link'} /> {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
