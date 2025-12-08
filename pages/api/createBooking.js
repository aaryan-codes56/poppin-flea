import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, phone, email, area, date, timeSlot, adults, children, comments } = req.body;

        // Basic validation
        if (!name || !phone || !email || !area || !date || !timeSlot || !adults) {
            return res.status(400).json({ message: 'Missing required fields' });
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

        // 1. Fetch existing bookings to check limit
        const getRows = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:E', // We only need up to column E (Date) to check
        });

        const rows = getRows.data.values || [];
        // Filter rows that match the requested date
        // Assuming Date is in column index 4 (E) based on previous structure: Name, Phone, Email, Area, Date...
        // Let's verify structure: [name, phone, email, area, date, timeSlot, adults, children, comments, timestamp, status]
        const dateColumnIndex = 4;
        const bookingsForDate = rows.filter(row => row[dateColumnIndex] === date);

        if (bookingsForDate.length >= 15) {
            return res.status(400).json({ message: 'Sorry, we are fully booked for this date. Please come back tomorrow!' });
        }

        // 2. If limit not reached, append new booking
        const nextRowIndex = rows.length ? rows.length : 1;
        const refId = String(nextRowIndex).padStart(3, '0');

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:L',
            valueInputOption: 'USER_ENTERED',
            includeValuesInResponse: true,
            requestBody: {
                values: [
                    [refId, name, phone, email, area, date, timeSlot, adults, children, comments || '', '', 'Reserved'],
                ],
            },
        });

        // 3. Send Confirmation Email
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
                    to: email,
                    subject: `Booking Confirmed - #${refId} - PoppinFlea`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #FFE103; text-shadow: 1px 1px 0 #000;">Booking Confirmed! 🎉</h2>
                            <p>Hi ${name},</p>
                            <p>Thanks for booking a table at PoppinFlea! Here are your details:</p>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 1.2rem; font-weight: bold;">Reference ID: #${refId}</p>
                            </div>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Date:</strong> ${date}</li>
                                <li><strong>Time:</strong> ${timeSlot}</li>
                                <li><strong>Area:</strong> ${area}</li>
                                <li><strong>Guests:</strong> ${adults} Adults, ${children} Children</li>
                                <li><strong>Venue:</strong> Cafe The Cartel, Vidyapati Marg, Patna</li>
                            </ul>
                            <p>We look forward to seeing you!</p>
                            <p style="font-size: 0.8rem; color: #888;">If you need to cancel, please contact us.</p>
                        </div>
                    `,
                };
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        } else {
            console.log('Email credentials not found. Skipping email confirmation.');
        }

        res.status(200).json({ message: 'Booking created successfully', data: response.data });
    } catch (error) {
        console.error('Google Sheets API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
