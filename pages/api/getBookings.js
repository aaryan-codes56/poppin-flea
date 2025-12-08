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
        const bookings = rows
            .filter((row, index) => {
                // Filter out if it's the header row (checking first column)
                if (row[0] === 'Ref ID') return false;
                // Filter out if Ref ID is missing or Name is empty
                if (!row[0] || !row[1]) return false;
                return true;
            })
            .map((row, index) => {
                // Column Order: 
                // 0: Ref ID, 1: Name, 2: Phone, 3: Email, 4: Area, 5: Date, 6: Time, 
                // 7: Adults, 8: Children, 9: Comments, 10: Transaction ID, 11: UPI Name, 12: Action, 13: Status
                return {
                    refId: row[0] || 'N/A',
                    name: row[1] || '',
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
                    rowIndex: index + 1, // We can't rely on original index if we filter. 
                    // But we need the SHEET row index for updates.
                    // This is tricky. If we filter, 'index' in map is new index.
                };
            });

        // We need to preserve the original row index for updates (cancel/confirm).
        // Let's map FIRST, then filter.
        const mappedBookings = rows.map((row, index) => ({
            refId: row[0] || 'N/A',
            name: row[1] || '',
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
            status: row[13] || 'Reserved',
            rowIndex: index, // 0-based index from the fetch result
        }));

        const finalBookings = mappedBookings.filter(b => b.refId !== 'Ref ID' && b.refId !== 'N/A' && b.name.trim() !== '');

        res.status(200).json({ bookings: finalBookings });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
