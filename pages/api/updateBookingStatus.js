import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { rowIndex, status } = req.body;

        if (rowIndex === undefined || rowIndex === null || !status) {
            return res.status(400).json({ message: 'Missing row index or status' });
        }

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

        // The status column is column L (12th column, index 11)
        // Row index from client is 0-based index of the data array, which starts at row 2 in the sheet (row 1 is header)
        // So actual sheet row number = rowIndex + 2
        const sheetRowNumber = rowIndex + 2;
        const range = `Sheet1!L${sheetRowNumber}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[status]],
            },
        });

        res.status(200).json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
