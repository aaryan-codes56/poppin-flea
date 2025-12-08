import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, phone, email, area, date, timeSlot, adults, children, comments, transactionId, upiName } = req.body;

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
        // Date is in column index 4 (E)
        const dateColumnIndex = 4;
        const bookingsForDate = rows.filter(row => row[dateColumnIndex] === date);

        if (bookingsForDate.length >= 15) {
            return res.status(400).json({ message: 'Sorry, we are fully booked for this date. Please come back tomorrow!' });
        }

        // 2. If limit not reached, append new booking
        const nextRowIndex = rows.length ? rows.length : 1;
        const refId = String(nextRowIndex).padStart(3, '0');
        const status = 'Pending Verification';

        // New Column Order: Ref ID | Name | Phone | Email | Area | Date | Time | Adults | Children | Comments | Transaction ID | UPI Name | Action | Status
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:N', // Extended range to N
            valueInputOption: 'USER_ENTERED',
            includeValuesInResponse: true,
            requestBody: {
                values: [
                    [refId, name, phone, email, area, date, timeSlot, adults, children, comments || '', transactionId || '', upiName || '', '', status],
                ],
            },
        });

        // 3. Send "Booking Received" Email
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
                    subject: `Booking Received - #${refId} - PoppinFlea`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #FFE103; text-shadow: 1px 1px 0 #000;">Booking Request Received! ⏳</h2>
                            <p>Hi ${name},</p>
                            <p>We have received your booking request and payment details.</p>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 1.2rem; font-weight: bold;">Reference ID: #${refId}</p>
                                <p style="margin: 5px 0 0 0; color: #666;">Status: <strong>Pending Verification</strong></p>
                            </div>
                            <p>We will verify your payment (Transaction ID: ${transactionId}) within <strong>12-15 hours</strong>.</p>
                            <p>Once verified, you will receive a final confirmation email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Date:</strong> ${date}</li>
                                <li><strong>Time:</strong> ${timeSlot}</li>
                                <li><strong>Area:</strong> ${area}</li>
                                <li><strong>Guests:</strong> ${adults} Adults, ${children} Children</li>
                            </ul>
                            <p style="font-size: 0.8rem; color: #888;">If you have any questions, please reply to this email.</p>
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
