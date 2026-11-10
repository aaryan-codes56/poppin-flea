// Customer table bookings. Keeps the original Sheet1 layout (columns A–N)
// exactly as before so existing records and scripts keep working:
// Ref ID | Name | Phone | Email | Area | Date | Time Slot | Adults | Children |
// Comments | Transaction ID | UPI Name | Screenshot Link | Status

import fs from 'fs/promises';
import path from 'path';
import { getSheets, dataDriver, sheetSafe } from './google';

export const COL = {
  REF: 0, NAME: 1, PHONE: 2, EMAIL: 3, AREA: 4, DATE: 5, TIME: 6,
  ADULTS: 7, CHILDREN: 8, COMMENTS: 9, TXN: 10, UPI: 11, SCREENSHOT: 12, STATUS: 13,
};

export const HEADER = [
  'Ref ID', 'Name', 'Phone', 'Email', 'Area', 'Date', 'Time Slot', 'Adults', 'Children',
  'Comments', 'Transaction ID', 'UPI Name', 'Screenshot Link', 'Status',
];

const LOCAL_FILE = path.join(process.cwd(), '.data', 'table-bookings.json');

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return [HEADER];
    throw e;
  }
}
async function writeLocal(rows) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(rows, null, 2));
}

// All rows including the header, as arrays (row 1 = index 0).
export async function getAllRows() {
  if (dataDriver() === 'local') return readLocal();
  const { sheets, spreadsheetId } = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Sheet1!A:N' });
  return res.data.values || [];
}

export async function appendRow(values) {
  if (dataDriver() === 'local') {
    const rows = await readLocal();
    rows.push(values.map((v) => (v === undefined || v === null ? '' : String(v))));
    await writeLocal(rows);
    return;
  }
  const { sheets, spreadsheetId } = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values.map(sheetSafe)] },
  });
}

export async function getRow(rowIndex) {
  const n = Number(rowIndex);
  if (!Number.isInteger(n) || n < 2) return null;
  if (dataDriver() === 'local') return (await readLocal())[n - 1] || null;
  const { sheets, spreadsheetId } = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `Sheet1!A${n}:N${n}` });
  return res.data.values ? res.data.values[0] : null;
}

export async function setStatus(rowIndex, status) {
  const n = Number(rowIndex);
  if (!Number.isInteger(n) || n < 2) throw new Error('Invalid row index');
  if (dataDriver() === 'local') {
    const rows = await readLocal();
    if (!rows[n - 1]) throw new Error('Row not found');
    rows[n - 1][COL.STATUS] = status;
    await writeLocal(rows);
    return;
  }
  const { sheets, spreadsheetId } = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!N${n}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] },
  });
}

export function rowToBooking(row, rowIndex) {
  return {
    refId: row[COL.REF] ? String(row[COL.REF]).trim() : 'N/A',
    name: row[COL.NAME] ? String(row[COL.NAME]).trim() : '',
    phone: row[COL.PHONE] || '',
    email: row[COL.EMAIL] || '',
    area: row[COL.AREA] || '',
    date: row[COL.DATE] || '',
    timeSlot: row[COL.TIME] || '',
    adults: row[COL.ADULTS] || '1',
    children: row[COL.CHILDREN] || '0',
    comments: row[COL.COMMENTS] || '',
    transactionId: row[COL.TXN] || '',
    upiName: row[COL.UPI] || '',
    screenshotLink: row[COL.SCREENSHOT] || '',
    status: row[COL.STATUS] || 'Reserved',
    rowIndex,
  };
}

export function isHeaderOrEmpty(b) {
  return (
    b.refId === 'Ref ID' || b.refId === '#Reference ID' || b.refId.startsWith('#Ref') ||
    b.name === 'Name' || b.status === 'Status' || b.refId === 'N/A' || !b.name
  );
}
