import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { rowIndex, bookingDetails } = req.body;

        if (rowIndex === undefined || !bookingDetails) {
            return res.status(400).json({ message: 'Missing row index or booking details' });
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

        // 1. Update Status to "Reserved" in Column N (Index 13)
        // Row index is passed from frontend (0-based from the array, so +2 for 1-based sheet index with header)
        const sheetRowIndex = rowIndex + 2;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Sheet1!N${sheetRowIndex}`, // Column N is Status
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['Reserved']],
            },
        });

        // 2. Send "Booking Confirmed" Email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
                    to: bookingDetails.email,
                    subject: `Payment Verified & Booking Confirmed! - #${bookingDetails.refId} - PoppinFlea`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #22c55e; text-shadow: 1px 1px 0 #000;">Payment Verified! ✅</h2>
                            <p>Hi ${bookingDetails.name},</p>
                            <p>Great news! We have verified your payment and your booking is now <strong>CONFIRMED</strong>.</p>
                            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #22c55e;">
                                <p style="margin: 0; font-size: 1.2rem; font-weight: bold; color: #15803d;">Reference ID: #${bookingDetails.refId}</p>
                            </div>
                            <p>Please be at the venue on your booked time and show this email at the reception if needed.</p>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Date:</strong> ${bookingDetails.date}</li>
                                <li><strong>Time:</strong> ${bookingDetails.timeSlot}</li>
                                <li><strong>Area:</strong> ${bookingDetails.area}</li>
                                <li><strong>Guests:</strong> ${bookingDetails.adults} Adults, ${bookingDetails.children} Children</li>
                                <li><strong>Venue:</strong> Cafe The Cartel, Vidyapati Marg, Patna</li>
                            </ul>
                            <p>See you there!</p>
                        </div>
                    `,
                };
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        res.status(200).json({ message: 'Payment confirmed and email sent' });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
