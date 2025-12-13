import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const getRows = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N', // Fetch all columns including Status (N)
        });

        const rows = getRows.data.values || [];

        // Column Indices (0-based)
        // 4: Area, 5: Date, 6: TimeSlot, 13: Status
        const AREA_COL = 4;
        const DATE_COL = 5;
        const TIME_COL = 6;
        const STATUS_COL = 13;

        // Only count CONFIRMED bookings (not pending verification)
        const confirmedStatuses = ['Reserved', 'Confirmed', 'Guest Arrived', 'Arrived'];

        const bookingsForDate = rows.filter(row =>
            row[DATE_COL] === date &&
            confirmedStatuses.includes(row[STATUS_COL])
        );

        const timeSlots = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
        const areas = [
            { name: "Indoor", limit: 16 },
            { name: "Library (Smoking)", limit: 4 }
        ];

        const availability = {};

        timeSlots.forEach(slot => {
            availability[slot] = {};

            areas.forEach(area => {
                const count = bookingsForDate.filter(row =>
                    row[TIME_COL] === slot && row[AREA_COL] === area.name
                ).length;

                let status = 'green';
                if (count >= area.limit) {
                    status = 'red';
                } else if (count >= area.limit * 0.5) {
                    status = 'yellow';
                }

                availability[slot][area.name] = {
                    count,
                    limit: area.limit,
                    status
                };
            });
        });

        res.status(200).json({ availability });
    } catch (error) {
        console.error('getSlots Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
