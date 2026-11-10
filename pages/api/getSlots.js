import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import { getAllRows, COL } from '@/lib/server/bookings';
import { rateLimit, clientIp } from '@/lib/server/rateLimit';

// Public: returns only counts per slot/area, never personal data.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  if (!rateLimit(`slots:${clientIp(req)}`, 60, 60_000)) return res.status(429).json({ message: 'Too many requests' });

  const { date } = req.query;
  if (!date || !TABLE_BOOKING.dates.some((d) => d.value === date)) {
    return res.status(400).json({ message: 'A valid date is required' });
  }

  try {
    const rows = (await getAllRows()).filter((r) => r[COL.DATE] === date && r[COL.STATUS] !== 'Cancelled');
    const availability = {};
    for (const slot of TABLE_BOOKING.timeSlots) {
      availability[slot] = {};
      for (const area of TABLE_BOOKING.areas) {
        const count = rows
          .filter((r) => r[COL.TIME] === slot && r[COL.AREA] === area.name)
          .reduce((t, r) => t + (parseInt(r[COL.ADULTS] || 0, 10) || 0), 0);
        const status = count >= area.limit ? 'red' : count >= area.limit * 0.5 ? 'yellow' : 'green';
        availability[slot][area.name] = { count, limit: area.limit, status };
      }
    }
    return res.status(200).json({ availability });
  } catch (error) {
    console.error('getSlots error:', error.message);
    return res.status(500).json({ message: 'Could not load availability' });
  }
}
