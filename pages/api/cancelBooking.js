import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { rowIndex } = req.body;

        if (rowIndex === undefined || rowIndex === null) {
            return res.status(400).json({ message: 'Missing row index' });
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

        // The status column is column K (11th column, index 10)
        // Row index from client is the ACTUAL sheet row number
        const sheetRowNumber = rowIndex;

        // 1. Fetch the row to get email and name
        const getRow = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `Sheet1!A${sheetRowNumber}:L${sheetRowNumber}`,
        });

        const rowValues = getRow.data.values ? getRow.data.values[0] : [];
        const refId = rowValues[0]; // Ref ID is now at index 0
        const name = rowValues[1];  // Name is now at index 1
        const email = rowValues[3]; // Email is now at index 3

        // 2. Update Status to "Cancelled" in Column N (Index 13)
        // Row index is passed from frontend
        const sheetRowIndex = rowIndex;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Sheet1!N${sheetRowIndex}`, // Column N is Status
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['Cancelled']],
            },
        });

        // 3. Send Cancellation Email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && email) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: `"PoppinFlea" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Booking Cancelled - #${refId || 'N/A'} - PoppinFlea`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #ef4444;">Booking Cancelled 😞</h2>
                            <p>Hi ${name},</p>
                            <p>We are sorry, but we had to cancel your reservation at PoppinFlea.</p>
                            <p><strong>Reason:</strong> We are fully booked or there was an issue with your reservation.</p>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 1.2rem; font-weight: bold;">Reference ID: #${refId || 'N/A'}</p>
                            </div>
                            <p>If you have any questions, please reply to this email.</p>
                            <p>We hope to see you another time!</p>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
