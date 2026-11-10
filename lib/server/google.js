import { google } from 'googleapis';

let cached = null;

export function sheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  );
}

export function getSheets() {
  if (!sheetsConfigured()) {
    throw new Error('Google Sheets is not configured (GOOGLE_SHEETS_* / GOOGLE_SHEET_ID missing).');
  }
  if (!cached) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    cached = { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId: process.env.GOOGLE_SHEET_ID };
  }
  return cached;
}

// Which storage backend to use. Development defaults to local JSON files so
// testing never touches the production spreadsheet.
export function dataDriver() {
  const explicit = process.env.DATA_DRIVER;
  if (explicit === 'local' || explicit === 'sheets') return explicit;
  return process.env.NODE_ENV === 'production' ? 'sheets' : 'local';
}

// Stop spreadsheet formula injection for values written with USER_ENTERED.
export function sheetSafe(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
