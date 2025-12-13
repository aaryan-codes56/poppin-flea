const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
try {
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
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

async function testUpload() {
    console.log('Testing Drive Upload...');
    console.log('Client Email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
    console.log('Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: 'Test_Upload_Bot.txt',
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };
        const media = {
            mimeType: 'text/plain',
            body: 'Hello World! This is a test upload from the PoppinFlea bot.',
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        console.log('✅ Upload Successful!');
        console.log('File ID:', file.data.id);
        console.log('WebView Link:', file.data.webViewLink);

        // Clean up
        await drive.files.delete({ fileId: file.data.id });
        console.log('Test file deleted.');

    } catch (error) {
        console.error('❌ Upload Failed!');
        console.error('Error Message:', error.message);
        if (error.errors) {
            console.error('Error Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

testUpload();
