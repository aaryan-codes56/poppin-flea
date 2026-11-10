import { withAdmin } from '@/lib/server/auth';
import { setStatus } from '@/lib/server/bookings';
import { BOOKING_STATUSES } from '@/lib/config/tableBooking';
import { body } from '@/lib/server/validate';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { rowIndex, status } = body(req);
  if (!Number.isInteger(Number(rowIndex)) || Number(rowIndex) < 2) return res.status(400).json({ message: 'Invalid row index' });
  if (!BOOKING_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await setStatus(rowIndex, status);
    return res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('updateBookingStatus error:', error.message);
    return res.status(500).json({ message: 'Could not update status' });
  }
}

export default withAdmin(handler);
