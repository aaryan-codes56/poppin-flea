const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1];
        let value = match[2];
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        process.env[key] = value.replace(/\\n/g, '\n');
    }
});

async function setupHeader() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Set header row with all columns including Screenshot Link
        const headers = [
            'Ref ID',
            'Name',
            'Phone',
            'Email',
            'Area',
            'Date',
            'Time Slot',
            'Adults',
            'Children',
            'Comments',
            'Transaction ID',
            'UPI Name',
            'Screenshot Link',  // Column M
            'Status'            // Column N
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1:N1',
            valueInputOption: 'RAW',
            requestBody: {
                values: [headers],
            },
        });

        console.log('Header row set successfully!');
        console.log('Columns:', headers.join(' | '));
    } catch (error) {
        console.error('Error setting header:', error);
    }
}

setupHeader();
