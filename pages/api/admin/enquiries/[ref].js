import { withAdmin } from '@/lib/server/auth';
import { store } from '@/lib/server/store';
import { ENQUIRY_STATUS_KEYS } from '@/lib/config/crm';
import { body, clean, isISODate } from '@/lib/server/validate';

// Update an enquiry's status, follow-up date, or add an internal note.
async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });
  const ref = String(req.query.ref || '');
  if (!/^PWC26-[A-Z0-9]{6}$/.test(ref)) return res.status(400).json({ message: 'Invalid reference' });

  const input = body(req);
  const current = await store.get('vendorEnquiries', ref);
  if (!current) return res.status(404).json({ message: 'Enquiry not found' });

  const now = new Date().toISOString();
  const patch = { updatedAt: now, updatedBy: req.admin.email };
  const log = [];

  if (input.status !== undefined) {
    if (!ENQUIRY_STATUS_KEYS.includes(input.status)) return res.status(400).json({ message: 'Invalid status' });
    if (input.status !== current.status) {
      patch.status = input.status;
      log.push(`Status: ${current.status} → ${input.status}`);
    }
  }
  if (input.followUpDate !== undefined) {
    const d = clean(input.followUpDate, 10);
    if (d && !isISODate(d)) return res.status(400).json({ message: 'Invalid follow-up date' });
    patch.followUpDate = d;
    if (d !== current.followUpDate) log.push(d ? `Follow-up set for ${d}` : 'Follow-up cleared');
  }
  const note = clean(input.note, 1000);
  if (note) log.push(note);

  if (log.length) {
    const stamp = `[${now.slice(0, 16).replace('T', ' ')} UTC · ${req.admin.email}]`;
    const entry = `${stamp} ${log.join(' · ')}`;
    patch.notes = current.notes ? `${entry}\n${current.notes}` : entry;
  }

  try {
    const updated = await store.update('vendorEnquiries', ref, patch);
    return res.status(200).json({ enquiry: updated });
  } catch (error) {
    console.error('update enquiry error:', error.message);
    return res.status(500).json({ message: 'Could not update enquiry' });
  }
}

export default withAdmin(handler);
