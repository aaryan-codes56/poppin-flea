import { withAdmin, ROLES } from '@/lib/server/auth';
import { store } from '@/lib/server/store';
import { toCsv, sendCsv } from '@/lib/server/csv';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const subscribers = (await store.list('subscribers')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (req.query.format === 'csv') {
      const active = subscribers.filter((s) => s.status === 'subscribed');
      return sendCsv(
        res,
        `poppin-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
        toCsv(active, [
          { key: 'email', label: 'Email' }, { key: 'name', label: 'Name' },
          { key: 'createdAt', label: 'Subscribed' }, { key: 'source', label: 'Source' },
        ])
      );
    }
    return res.status(200).json({ subscribers });
  } catch (e) {
    console.error('subscribers error:', e.message);
    return res.status(500).json({ message: 'Could not load subscribers' });
  }
}

export default withAdmin(handler, { roles: [ROLES.admin] });
