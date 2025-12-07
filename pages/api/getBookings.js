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
            range: 'Sheet1!A:K', // Fetching columns A to K (including Comments and Status)
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
            id: index, // Simple ID based on index
            name: row[0] || '',
            phone: row[1] || '',
            email: row[2] || '',
            area: row[3] || '',
            date: row[4] || '',
            timeSlot: row[5] || '',
            adults: row[6] || '',
            children: row[7] || '',
            comments: row[8] || '',
            timestamp: row[9] || '',
            status: row[10] || 'Reserved',
        }));

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
