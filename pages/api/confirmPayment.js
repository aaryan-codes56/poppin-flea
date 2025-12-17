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
        // Row index is passed from frontend (It is now the ACTUAL sheet row index)
        const sheetRowIndex = rowIndex;

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
                    from: `"Poppin" <${process.env.EMAIL_USER}>`,
                    to: bookingDetails.email,
                    subject: `🎉 Table Confirmed! - #${bookingDetails.refId} - Poppin`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #22c55e;">Hey there! 👋</h2>
                            <p>Your table reservation at <strong>Poppin</strong> is confirmed — we can't wait to host you!</p>
                            
                            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #22c55e;">
                                <p style="margin: 0; font-size: 1.2rem; font-weight: bold; color: #15803d;">Reference ID: #${bookingDetails.refId}</p>
                            </div>
                            
                            <h3 style="color: #374151;">📋 Booking Details</h3>
                            <ul style="list-style: none; padding: 0; line-height: 1.8;">
                                <li><strong>Date:</strong> ${bookingDetails.date}</li>
                                <li><strong>Time:</strong> ${bookingDetails.timeSlot}</li>
                                <li><strong>Area:</strong> ${bookingDetails.area}</li>
                                <li><strong>Guests:</strong> ${bookingDetails.adults} Adults, ${bookingDetails.children} Children</li>
                                <li><strong>Venue:</strong> Cafe The Cartel, Vidyapati Marg, Patna</li>
                            </ul>
                            <p style="margin-top: 10px;">
                                <a href="https://www.google.com/maps?daddr=1274A/1,+Vidyapati+Marg,+beside+Vidyapati+Bhawan,+Lodipur,+Patna,+Bihar+800001" 
                                   style="display: inline-block; background-color: #FFE103; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                    📍 Get Directions
                                </a>
                            </p>
                            
                            <h3 style="color: #374151;">💳 About Your Payment</h3>
                            <p>The total amount you paid will be <strong>fully reimbursed in your final bill</strong>.</p>
                            <p>To collect your voucher, just reach out to the <strong>Reception at the entry gate</strong> when you arrive.</p>
                            
                            <h3 style="color: #374151;">⏰ Table Time Info</h3>
                            <ul style="list-style: disc; padding-left: 20px; line-height: 1.8;">
                                <li>Your table is reserved for <strong>45 minutes</strong></li>
                                <li>We give a <strong>15-minute buffer</strong> (in case of small delays)</li>
                                <li>Please arrive on time so you get the best experience!</li>
                            </ul>
                            <p>Poppin gets packed, so this helps us keep the vibe smooth for everyone 💃🕺</p>
                            
                            <p>If you need any help, our crew at the gate has you covered.</p>
                            <p style="font-size: 1.1rem;"><strong>See you at Poppin — let's make it fun! ✨</strong></p>
                            <p>Cheers,<br><strong>Team Poppin</strong></p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                            
                            <div style="font-size: 0.75rem; color: #6b7280;">
                                <h4 style="margin-bottom: 10px; color: #374151;">Terms & Conditions</h4>
                                <ul style="padding-left: 15px; line-height: 1.6;">
                                    <li><strong>Table Confirmation:</strong> Your table is confirmed only after successful payment.</li>
                                    <li><strong>Voucher Collection:</strong> Amount paid will be reimbursed in final bill. Collect voucher from Reception.</li>
                                    <li><strong>Table Duration:</strong> Reserved for 45 minutes with 15-minute buffer for delays.</li>
                                    <li><strong>Late Arrival:</strong> After 15-minute buffer, table may be released without refund.</li>
                                    <li><strong>Non-Transferable:</strong> Reservations and vouchers are non-transferable, same-day use only.</li>
                                    <li><strong>No Cash Refunds:</strong> Amounts are only adjustable against final bill.</li>
                                    <li><strong>Conduct:</strong> Respectful behaviour expected. Poppin reserves right to refuse service.</li>
                                </ul>
                                <p style="margin-top: 10px;">Full T&C: <a href="https://poppinflea.com/terms" style="color: #2563eb;">poppinflea.com/terms</a></p>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 20px; font-size: 0.9rem; color: #666;">
                            <p>For any queries: <strong>8709294143</strong> / <strong>9334227855</strong></p>
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
