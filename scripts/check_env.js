// Reports which environment variables are set — never prints their values.
require('dotenv').config({ path: '.env.local' });

const groups = {
  'Google Sheets': ['GOOGLE_SHEETS_CLIENT_EMAIL', 'GOOGLE_SHEETS_PRIVATE_KEY', 'GOOGLE_SHEET_ID'],
  Email: ['EMAIL_USER', 'EMAIL_PASS', 'ORGANISER_EMAIL'],
  Cloudinary: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
  'Admin auth': ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET', 'STAFF_EMAIL', 'STAFF_PASSWORD_HASH'],
  Site: ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_TABLE_BOOKING_ENABLED', 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN', 'DATA_DRIVER', 'EMAIL_DRIVER'],
};

for (const [group, keys] of Object.entries(groups)) {
  console.log(`\n${group}`);
  for (const k of keys) console.log(`  ${process.env[k] ? '✅' : '—'} ${k}`);
}
