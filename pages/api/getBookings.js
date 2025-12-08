import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N', // Fetching columns A to N (including Status)
        });

        const rows = response.data.values;
        console.log('Fetched rows from Sheets:', rows ? rows.length : 0);

        if (!rows || rows.length === 0) {
            console.log('No rows found.');
            return res.status(200).json({ bookings: [] });
        }

        // Filter out header row and invalid rows
        // 1. Map FIRST to preserve the original sheet row index
        const mappedBookings = rows.map((row, index) => {
            // Sheet rows are 1-indexed. 
            // row[0] is the first row in the 'values' array.
            // If we fetched 'Sheet1!A:N', row[0] corresponds to the first row of that range.
            // Usually A1 is the first row. So index 0 -> Row 1.
            const sheetRowIndex = index + 1;

            return {
                refId: row[0] ? String(row[0]).trim() : 'N/A',
                name: row[1] ? String(row[1]).trim() : '',
                phone: row[2] || '',
                email: row[3] || '',
                area: row[4] || '',
                date: row[5] || '',
                timeSlot: row[6] || '',
                adults: row[7] || '1',
                children: row[8] || '0',
                comments: row[9] || '',
                transactionId: row[10] || '',
                upiName: row[11] || '',
                status: row[13] || 'Reserved', // Status is at index 13 (Column N)
                rowIndex: sheetRowIndex, // CRITICAL: This must be the actual row number in the sheet
            };
        });

        // 2. Filter AFTER mapping
        const bookings = mappedBookings.filter(booking => {
            const { refId, name, status } = booking;

            // Debug log for header detection
            if (refId.includes('Ref') || name === 'Name') {
                console.log(`Filtering row ${booking.rowIndex}: RefID="${refId}", Name="${name}"`);
            }

            // Aggressive Header Check
            if (
                refId === 'Ref ID' ||
                refId === '#Reference ID' ||
                refId.startsWith('#Ref') ||
                name === 'Name' ||
                status === 'Status'
            ) {
                return false;
            }

            // Invalid Data Check
            if (refId === 'N/A' || !name) {
                return false;
            }

            return true;
        });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
