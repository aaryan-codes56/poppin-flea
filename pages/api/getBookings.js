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
            range: 'Sheet1!A:L', // Fetching columns A to L (including Ref ID)
        });

        const rows = response.data.values;
        console.log('Fetched rows from Sheets:', rows ? rows.length : 0);

        if (!rows || rows.length === 0) {
            console.log('No rows found.');
            return res.status(200).json({ bookings: [] });
        }

        // Assuming first row is header
        // const headers = rows[0];
        const bookings = rows.slice(1).map((row, index) => ({
            id: index, // Using index as a temporary ID for frontend keys
            refId: row[0] || '',
            name: row[1] || '',
            phone: row[2] || '',
            email: row[3] || '',
            area: row[4] || '',
            date: row[5] || '',
            timeSlot: row[6] || '',
            adults: row[7] || '',
            children: row[8] || '',
            comments: row[9] || '',
            // Action column at index 10 is skipped
            status: row[11] || 'Reserved',
            timestamp: row[12] || '', // Timestamp is now appended at the end, index 12
        }));

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
