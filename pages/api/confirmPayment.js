import { withAdmin } from '@/lib/server/auth';
import { getRow, setStatus, rowToBooking } from '@/lib/server/bookings';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import { body, isEmail } from '@/lib/server/validate';
import { sendMail, bookingConfirmedEmail } from '@/lib/server/mailer';

// Booking details are read from the sheet, never trusted from the browser.
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { rowIndex } = body(req);
  try {
    const row = await getRow(rowIndex);
    if (!row) return res.status(404).json({ message: 'Booking not found' });
    const b = rowToBooking(row, Number(rowIndex));
    await setStatus(rowIndex, 'Reserved');
    if (isEmail(b.email)) {
      await sendMail({
        to: b.email,
        ...bookingConfirmedEmail({ ...b, venue: TABLE_BOOKING.venue, queriesPhone: TABLE_BOOKING.queriesPhone }),
      });
    }
    return res.status(200).json({ message: 'Payment confirmed and email sent' });
  } catch (error) {
    console.error('confirmPayment error:', error.message);
    return res.status(500).json({ message: 'Could not confirm payment' });
  }
}

export default withAdmin(handler);
