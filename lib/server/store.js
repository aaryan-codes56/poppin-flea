// Small document store for the newer features (vendor enquiries,
// announcements, subscribers). Each collection is one tab in the existing
// spreadsheet, or one JSON file under .data/ when running locally.

import fs from 'fs/promises';
import path from 'path';
import { getSheets, dataDriver } from './google';

export const COLLECTIONS = {
  vendorEnquiries: {
    tab: 'Vendor Enquiries',
    key: 'ref',
    fields: [
      'ref', 'createdAt', 'brandName', 'contactName', 'phone', 'email', 'instagram',
      'category', 'description', 'stallPreference', 'requirements', 'consent',
      'status', 'notes', 'followUpDate', 'updatedAt', 'updatedBy', 'source',
    ],
  },
  announcements: {
    tab: 'Announcements',
    key: 'id',
    fields: ['id', 'createdAt', 'updatedAt', 'type', 'title', 'body', 'linkUrl', 'linkLabel', 'published', 'pinned'],
  },
  subscribers: {
    tab: 'Subscribers',
    key: 'email',
    fields: ['email', 'name', 'status', 'consent', 'source', 'createdAt', 'updatedAt'],
  },
};

function spec(name) {
  const s = COLLECTIONS[name];
  if (!s) throw new Error(`Unknown collection: ${name}`);
  return s;
}

function colLetter(n) {
  let s = '';
  for (let i = n; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}

// ---------- Local JSON driver ----------
const DATA_DIR = path.join(process.cwd(), '.data');
const locks = new Map();

async function withLock(file, fn) {
  const prev = locks.get(file) || Promise.resolve();
  let release;
  const next = new Promise((r) => (release = r));
  locks.set(file, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function readLocal(name) {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `${name}.json`), 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeLocal(name, rows) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${name}.json`);
  await fs.writeFile(`${file}.tmp`, JSON.stringify(rows, null, 2));
  await fs.rename(`${file}.tmp`, file);
}

const local = {
  list: (name) => readLocal(name),
  insert: (name, doc) =>
    withLock(name, async () => {
      const rows = await readLocal(name);
      rows.push(doc);
      await writeLocal(name, rows);
      return doc;
    }),
  update: (name, key, patch) =>
    withLock(name, async () => {
      const { key: k } = spec(name);
      const rows = await readLocal(name);
      const i = rows.findIndex((r) => r[k] === key);
      if (i < 0) return null;
      rows[i] = { ...rows[i], ...patch };
      await writeLocal(name, rows);
      return rows[i];
    }),
  remove: (name, key) =>
    withLock(name, async () => {
      const { key: k } = spec(name);
      const rows = await readLocal(name);
      const next = rows.filter((r) => r[k] !== key);
      await writeLocal(name, next);
      return next.length !== rows.length;
    }),
};

// ---------- Google Sheets driver ----------
const tabIds = new Map();
const creating = new Map();

async function findTab(tab) {
  const { sheets, spreadsheetId } = getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties(sheetId,title)' });
  return meta.data.sheets.find((s) => s.properties.title === tab)?.properties.sheetId ?? null;
}

// Returns the tab's sheetId. Reads pass create=false so they never modify the
// spreadsheet (a missing tab just means "no rows yet"); only writes create it.
async function ensureTab(name, { create = true } = {}) {
  const { tab, fields } = spec(name);
  if (tabIds.has(tab)) return tabIds.get(tab);
  const existing = await findTab(tab);
  if (existing !== null) {
    tabIds.set(tab, existing);
    return existing;
  }
  if (!create) return null;
  if (!creating.has(tab)) {
    creating.set(
      tab,
      (async () => {
        const { sheets, spreadsheetId } = getSheets();
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: { requests: [{ addSheet: { properties: { title: tab, gridProperties: { frozenRowCount: 1 } } } }] },
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${tab}'!A1:${colLetter(fields.length)}1`,
            valueInputOption: 'RAW',
            requestBody: { values: [fields] },
          });
        } catch (e) {
          if (!/already exists/i.test(e.message)) throw e; // created concurrently elsewhere
        }
        const id = await findTab(tab);
        tabIds.set(tab, id);
        return id;
      })().finally(() => creating.delete(tab))
    );
  }
  return creating.get(tab);
}

function toRow(fields, doc) {
  return fields.map((f) => (doc[f] === undefined || doc[f] === null ? '' : String(doc[f])));
}

async function readSheet(name) {
  const { tab, fields } = spec(name);
  if ((await ensureTab(name, { create: false })) === null) return [];
  const { sheets, spreadsheetId } = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab}'!A:${colLetter(fields.length)}`,
  });
  const values = res.data.values || [];
  return values.slice(1).map((row, i) => {
    const doc = {};
    fields.forEach((f, j) => (doc[f] = row[j] ?? ''));
    doc._row = i + 2;
    return doc;
  });
}

const sheetsDriver = {
  list: async (name) => (await readSheet(name)).map(({ _row, ...d }) => d),
  insert: async (name, doc) => {
    const { tab, fields } = spec(name);
    await ensureTab(name);
    const { sheets, spreadsheetId } = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${tab}'!A:${colLetter(fields.length)}`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [toRow(fields, doc)] },
    });
    return doc;
  },
  update: async (name, key, patch) => {
    const { tab, fields, key: k } = spec(name);
    const rows = await readSheet(name);
    const found = rows.find((r) => r[k] === key);
    if (!found) return null;
    const { _row, ...current } = found;
    const next = { ...current, ...patch };
    const { sheets, spreadsheetId } = getSheets();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tab}'!A${_row}:${colLetter(fields.length)}${_row}`,
      valueInputOption: 'RAW',
      requestBody: { values: [toRow(fields, next)] },
    });
    return next;
  },
  remove: async (name, key) => {
    const { key: k } = spec(name);
    const sheetId = await ensureTab(name, { create: false });
    if (sheetId === null) return false;
    const rows = await readSheet(name);
    const found = rows.find((r) => r[k] === key);
    if (!found) return false;
    const { sheets, spreadsheetId } = getSheets();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: found._row - 1, endIndex: found._row } } }],
      },
    });
    return true;
  },
};

function driver() {
  return dataDriver() === 'sheets' ? sheetsDriver : local;
}

export const store = {
  list: (name) => (spec(name), driver().list(name)),
  get: async (name, key) => (await driver().list(name)).find((d) => d[spec(name).key] === key) || null,
  insert: (name, doc) => (spec(name), driver().insert(name, doc)),
  update: (name, key, patch) => driver().update(name, key, patch),
  remove: (name, key) => driver().remove(name, key),
};
