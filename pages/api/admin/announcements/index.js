import { withAdmin, ROLES } from '@/lib/server/auth';
import { store } from '@/lib/server/store';
import { shortCode } from '@/lib/server/tokens';
import { validateAnnouncement, revalidatePublicPages } from '@/lib/server/announcements';
import { body } from '@/lib/server/validate';

async function handler(req, res) {
  if (req.method === 'GET') {
    const items = (await store.list('announcements')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return res.status(200).json({ announcements: items });
  }
  if (req.method === 'POST') {
    const { values, error } = validateAnnouncement(body(req));
    if (error) return res.status(400).json({ message: error });
    const now = new Date().toISOString();
    const doc = { id: `ANN-${shortCode(8)}`, createdAt: now, updatedAt: now, ...values };
    try {
      await store.insert('announcements', doc);
      await revalidatePublicPages(res);
      return res.status(201).json({ announcement: doc });
    } catch (e) {
      console.error('create announcement error:', e.message);
      return res.status(500).json({ message: 'Could not save announcement' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAdmin(handler, { roles: [ROLES.admin] });
