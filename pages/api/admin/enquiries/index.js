import { withAdmin, ROLES } from '@/lib/server/auth';
import { store } from '@/lib/server/store';
import { toCsv, sendCsv } from '@/lib/server/csv';

const CSV_COLUMNS = [
  ['ref', 'Reference'], ['createdAt', 'Submitted'], ['status', 'Status'], ['brandName', 'Brand'],
  ['contactName', 'Contact'], ['phone', 'Phone'], ['email', 'Email'], ['instagram', 'Instagram'],
  ['category', 'Category'], ['stallPreference', 'Stall preference'], ['description', 'Products / services'],
  ['requirements', 'Requirements'], ['followUpDate', 'Follow-up'], ['notes', 'Internal notes'],
  ['updatedAt', 'Last updated'], ['updatedBy', 'Updated by'], ['source', 'Source'],
].map(([key, label]) => ({ key, label }));

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const enquiries = (await store.list('vendorEnquiries')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (req.query.format === 'csv') {
      if (req.admin.role !== ROLES.admin) return res.status(403).json({ message: 'Only admins can export data' });
      const date = new Date().toISOString().slice(0, 10);
      return sendCsv(res, `poppin-vendor-enquiries-${date}.csv`, toCsv(enquiries, CSV_COLUMNS));
    }
    return res.status(200).json({ enquiries, role: req.admin.role });
  } catch (error) {
    console.error('admin enquiries error:', error.message);
    return res.status(500).json({ message: 'Could not load enquiries' });
  }
}

export default withAdmin(handler);
