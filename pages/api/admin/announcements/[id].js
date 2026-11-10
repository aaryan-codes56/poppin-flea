import { withAdmin, ROLES } from '@/lib/server/auth';
import { store } from '@/lib/server/store';
import { validateAnnouncement, revalidatePublicPages } from '@/lib/server/announcements';
import { body } from '@/lib/server/validate';

async function handler(req, res) {
  const id = String(req.query.id || '');
  if (!/^ANN-[A-Z0-9]{8}$/.test(id)) return res.status(400).json({ message: 'Invalid id' });

  try {
    if (req.method === 'PATCH') {
      const current = await store.get('announcements', id);
      if (!current) return res.status(404).json({ message: 'Not found' });
      const { values, error } = validateAnnouncement({ ...current, ...body(req) });
      if (error) return res.status(400).json({ message: error });
      const updated = await store.update('announcements', id, { ...values, updatedAt: new Date().toISOString() });
      await revalidatePublicPages(res);
      return res.status(200).json({ announcement: updated });
    }
    if (req.method === 'DELETE') {
      const ok = await store.remove('announcements', id);
      if (ok) await revalidatePublicPages(res);
      return ok ? res.status(200).json({ ok: true }) : res.status(404).json({ message: 'Not found' });
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error('announcement error:', e.message);
    return res.status(500).json({ message: 'Could not update announcement' });
  }
}

export default withAdmin(handler, { roles: [ROLES.admin] });
