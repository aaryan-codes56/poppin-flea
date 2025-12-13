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

async function checkSheet() {
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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N',
        });

        const rows = response.data.values || [];
        console.log('Total rows:', rows.length);

        rows.forEach((row, index) => {
            console.log(`\nRow ${index + 1}:`);
            console.log('  Ref ID:', row[0] || 'empty');
            console.log('  Name:', row[1] || 'empty');
            console.log('  Transaction ID:', row[10] || 'empty');
            console.log('  UPI Name:', row[11] || 'empty');
            console.log('  Screenshot Link (Col M):', row[12] || 'EMPTY <-- issue here');
            console.log('  Status:', row[13] || 'empty');
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSheet();
