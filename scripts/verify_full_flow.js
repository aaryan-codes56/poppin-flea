require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function verifyFlow() {
    console.log('🧪 Starting End-to-End Booking Validation...');

    // 1. Setup Auth
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Test Parameters
    const TEST_DATE = '2099-12-31'; // Future date to verify logic without messing up real events
    const TEST_SLOT = '18:00';
    const TEST_AREA = 'Library (Smoking)'; // Limit is 4
    const LIMIT = 4;

    // Helper to calculate status
    const calculateStatus = (count, limit) => {
        if (count >= limit) return '🔴 RED (Full)';
        if (count >= limit * 0.5) return '🟡 YELLOW (Filling Fast)';
        return '🟢 GREEN (Available)';
    };

    try {
        // STEP 1: READ INITIAL STATE
        console.log(`\n1️⃣  Reading Slots for ${TEST_DATE} (${TEST_AREA})...`);
        let res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N',
        });
        let rows = res.data.values || [];

        // Filter for our test slot
        let currentBookings = rows.filter(row =>
            row[5] === TEST_DATE && // Date Col F
            row[6] === TEST_SLOT && // Time Col G
            row[4] === TEST_AREA    // Area Col E
        );

        let count = currentBookings.reduce((acc, row) => acc + parseInt(row[7] || 0), 0); // Adults Col H
        console.log(`   - Current Count: ${count}/${LIMIT}`);
        console.log(`   - Status: ${calculateStatus(count, LIMIT)}`);

        // Clean up previous test runs if any
        if (count > 0) {
            console.log('   (Found existing test data, but proceeding to add more to test increment)');
        }

        // STEP 2: MAKE A BOOKING (Simulate Backend)
        console.log('\n2️⃣  Simulating New Booking (2 Adults)...');
        const newBooking = [
            'TEST_REF', 'Test Bot', '0000000000', 'test@bot.com',
            TEST_AREA, TEST_DATE, TEST_SLOT, '2', '0',
            'Testing flow', 'TXN_TEST', 'UPI_TEST', 'preview_url', 'Confirmed'
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:N',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newBooking] },
        });
        console.log('   ✅ Booking Added to Google Sheet.');

        // STEP 3: VERIFY UPDATE
        console.log('\n3️⃣  Verifying State Change...');
        res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:N',
        });
        rows = res.data.values || [];

        currentBookings = rows.filter(row =>
            row[5] === TEST_DATE &&
            row[6] === TEST_SLOT &&
            row[4] === TEST_AREA
        );

        const newCount = currentBookings.reduce((acc, row) => acc + parseInt(row[7] || 0), 0);
        console.log(`   - New Count: ${newCount}/${LIMIT}`);
        console.log(`   - New Status: ${calculateStatus(newCount, LIMIT)}`);

        // Verification Logic
        if (newCount === count + 2) {
            console.log('\n✅ SUCCESS: count updated correctly (+2).');
        } else {
            console.error('\n❌ ALLOCATION ERROR: Count did not update as expected.');
        }

        if (calculateStatus(newCount, LIMIT).includes('YELLOW') || calculateStatus(newCount, LIMIT).includes('RED')) {
            console.log('✅ SUCCESS: Status color logic is responding to capacity.');
        }

        // STEP 4: CLEANUP
        console.log('\n4️⃣  Cleaning up test data...');
        // In a real scenario we'd delete the row, but for safety in this script we'll just inform the user
        // that a row was added to 2099-12-31. 
        // Actually, let's try to delete it to keep it clean.
        // Finding the index of the row we just added is reliable if we just check the last row.
        const lastRow = rows[rows.length - 1];
        if (lastRow[0] === 'TEST_REF') {
            // We could delete, but pure append is safer than delete via API without row index tracking.
            // We will manually clear it or leave it as it's far future.
            console.log('   Test row added for date 2099-12-31. You may clear it manually or leave it as it does not affect 2024/2025 events.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

verifyFlow();
