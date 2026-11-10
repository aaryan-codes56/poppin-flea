// Vendor pipeline. A public form submission is always "New"; only an admin
// can move an enquiry along — nothing is "Confirmed" automatically.

export const ENQUIRY_STATUSES = [
  { key: 'New', tone: 'info', hint: 'Just submitted, not yet contacted' },
  { key: 'Contacted', tone: 'neutral', hint: 'Team has reached out' },
  { key: 'Interested', tone: 'neutral', hint: 'Vendor wants to proceed' },
  { key: 'Approved', tone: 'good', hint: 'Application approved by the team' },
  { key: 'Payment Pending', tone: 'warn', hint: 'Awaiting stall payment' },
  { key: 'Confirmed', tone: 'good', hint: 'Stall confirmed' },
  { key: 'Rejected', tone: 'bad', hint: 'Not a fit this time' },
  { key: 'Cancelled', tone: 'bad', hint: 'Withdrawn or cancelled' },
];

export const ENQUIRY_STATUS_KEYS = ENQUIRY_STATUSES.map((s) => s.key);
export const OPEN_STATUSES = ['New', 'Contacted', 'Interested', 'Approved', 'Payment Pending'];

export const ANNOUNCEMENT_TYPES = [
  { key: 'venue', label: 'Venue reveal' },
  { key: 'vendors', label: 'Vendor announcement' },
  { key: 'partners', label: 'New partner' },
  { key: 'update', label: 'Event update' },
  { key: 'visitors', label: 'Visitor information' },
];
