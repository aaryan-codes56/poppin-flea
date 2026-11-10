import { withAdmin } from '@/lib/server/auth';
import { getRow, setStatus, COL } from '@/lib/server/bookings';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import { body, isEmail } from '@/lib/server/validate';
import { sendMail, bookingCancelledEmail } from '@/lib/server/mailer';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { rowIndex } = body(req);
  try {
    const row = await getRow(rowIndex);
    if (!row) return res.status(404).json({ message: 'Booking not found' });
    await setStatus(rowIndex, 'Cancelled');
    const email = row[COL.EMAIL];
    if (isEmail(email)) {
      await sendMail({
        to: email,
        ...bookingCancelledEmail({ refId: row[COL.REF], name: row[COL.NAME], queriesPhone: TABLE_BOOKING.queriesPhone }),
        fromName: 'PoppinFlea',
      });
    }
    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('cancelBooking error:', error.message);
    return res.status(500).json({ message: 'Could not cancel booking' });
  }
}

export default withAdmin(handler);
