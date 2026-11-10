// Customer table bookings (the system used for Christmas 2025 at Cafe The Cartel).
// Kept fully working but configuration-driven, so it can be reopened for a
// future edition without code changes to the API.
//
// To reopen: set TABLE_BOOKING_ENABLED=true and update the edition below.

export const TABLE_BOOKING = {
  enabled: process.env.NEXT_PUBLIC_TABLE_BOOKING_ENABLED === 'true',
  edition: 'Poppin Christmas 2025',
  venue: {
    name: 'Cafe The Cartel',
    address: 'Vidyapati Marg, beside Vidyapati Bhawan, Lodipur, Patna, Bihar 800001',
    mapUrl:
      'https://www.google.com/maps?daddr=1274A/1,+Vidyapati+Marg,+beside+Vidyapati+Bhawan,+Lodipur,+Patna,+Bihar+800001',
  },
  dates: [
    { value: '2025-12-24', label: 'Dec 24 (Wed) — Christmas Eve' },
    { value: '2025-12-25', label: 'Dec 25 (Thu) — Christmas Day' },
    { value: '2025-12-26', label: 'Dec 26 (Fri) — Post Christmas' },
  ],
  timeSlots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
  areas: [
    { name: 'Indoor', limit: 16 },
    { name: 'Library (Smoking)', limit: 4 },
  ],
  pricePerGuest: 250,
  slotMinutes: 45,
  // Contact numbers used for the 2025 table bookings (kept in booking emails).
  queriesPhone: '8709294143 / 9334227855',
};

export const BOOKING_STATUSES = [
  'Pending Verification',
  'Reserved',
  'Confirmed',
  'Guest Arrived',
  'Completed',
  'Cancelled',
];

export function areaLimit(areaName) {
  return TABLE_BOOKING.areas.find((a) => a.name === areaName)?.limit ?? null;
}
