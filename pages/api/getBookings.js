import { withAdmin } from '@/lib/server/auth';
import { getAllRows, rowToBooking, isHeaderOrEmpty } from '@/lib/server/bookings';

// Admin only: customer table bookings with personal data.
async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const rows = await getAllRows();
    const bookings = rows.map((row, i) => rowToBooking(row, i + 1)).filter((b) => !isHeaderOrEmpty(b));
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('getBookings error:', error.message);
    return res.status(500).json({ message: 'Could not load bookings' });
  }
}

export default withAdmin(handler);
