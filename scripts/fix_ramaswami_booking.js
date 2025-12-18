const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function fixBooking() {
    try {
        console.log('Authenticating with Google Sheets...');
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        console.log('Fetching bookings...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No rows found.');
            return;
        }

        let targetRowIndex = -1;
        let currentData = null;

        // Find Ramaswami
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const name = row[1] ? String(row[1]).trim() : ''; // Name is column B (index 1)

            if (name.toLowerCase().includes('ramaswami')) {
                // Sheet row index is 1-based, and i is 0-based index of values array.
                // If values starts at A1, then i=0 is Row 1.
                targetRowIndex = i + 1;
                currentData = row;
                console.log(`Found booking for "${name}" at Row ${targetRowIndex}`);
                console.log('Current Data:', row);
                break;
            }
        }

        if (targetRowIndex === -1) {
            console.log('Booking for "Ramaswami" not found.');
            return;
        }

        // Update Date (Col F, index 5) and Time (Col G, index 6)
        // Range should be Sheet1!F{row}:G{row}
        const updateRange = `Sheet1!F${targetRowIndex}:G${targetRowIndex}`;
        const newValues = [['2025-12-25', '16:00']];

        console.log(`Updating Row ${targetRowIndex}...`);
        console.log(`Range: ${updateRange}`);
        console.log(`New Values:`, newValues);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: newValues,
            },
        });

        console.log('✅ Successfully updated booking for Ramaswami.');

    } catch (error) {
        console.error('Error fixing booking:', error);
    }
}

fixBooking();
