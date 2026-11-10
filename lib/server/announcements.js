import { store } from './store';
import { clean } from './validate';
import { ANNOUNCEMENT_TYPES } from '../config/crm';

const bool = (v) => v === true || v === 'true' || v === 'TRUE';

export function validateAnnouncement(input) {
  const title = clean(input.title, 120);
  const bodyText = clean(input.body, 800);
  const type = ANNOUNCEMENT_TYPES.some((t) => t.key === input.type) ? input.type : null;
  const linkUrl = clean(input.linkUrl, 300);
  const linkLabel = clean(input.linkLabel, 40);
  if (title.length < 3) return { error: 'Title is required.' };
  if (!type) return { error: 'Choose an announcement type.' };
  if (linkUrl && !/^(https:\/\/|\/)/.test(linkUrl)) return { error: 'Links must start with https:// or /' };
  return {
    values: {
      title, body: bodyText, type, linkUrl, linkLabel: linkUrl ? linkLabel || 'Learn more' : '',
      published: bool(input.published) ? 'TRUE' : 'FALSE',
      pinned: bool(input.pinned) ? 'TRUE' : 'FALSE',
    },
  };
}

// Published announcements for public pages. Never throws: a storage problem
// must not take the homepage down.
export async function publishedAnnouncements(limit = 6) {
  try {
    const all = await store.list('announcements');
    return all
      .filter((a) => a.published === 'TRUE')
      .sort((a, b) => (b.pinned === 'TRUE') - (a.pinned === 'TRUE') || (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, limit)
      .map(({ id, createdAt, type, title, body, linkUrl, linkLabel, pinned }) => ({
        id, createdAt, type, title, body, linkUrl, linkLabel, pinned: pinned === 'TRUE',
      }));
  } catch (e) {
    console.error('Could not load announcements:', e.message);
    return [];
  }
}

// Refresh the public pages that show announcements (ISR on-demand revalidation).
export async function revalidatePublicPages(res) {
  for (const path of ['/', '/winter-carnival']) {
    try {
      await res.revalidate(path);
    } catch {
      /* not available in dev or if the page isn't built yet */
    }
  }
}
