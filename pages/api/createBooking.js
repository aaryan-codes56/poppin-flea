import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({ keepExtensions: true });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Formidable Parse Error:', err);
                    reject(err);
                }
                resolve([fields, files]);
            });
        });

        console.log('Fields received:', fields);
        console.log('Files received:', files);

        // Extract fields (formidable returns arrays for fields)
        const getField = (key) => Array.isArray(fields[key]) ? fields[key][0] : fields[key];

        const name = getField('name');
        const phone = getField('phone');
        const email = getField('email');
        const area = getField('area');
        const date = getField('date');
        const timeSlot = getField('timeSlot');
        const adults = getField('adults');
        const children = getField('children');
        const comments = getField('comments');
        const transactionId = getField('transactionId');
        const upiName = getField('upiName');

        // Basic validation
        if (!name || !phone || !email || !area || !date || !timeSlot || !adults) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate screenshot is provided
        const screenshotFile = files.screenshot ? (Array.isArray(files.screenshot) ? files.screenshot[0] : files.screenshot) : null;
        if (!screenshotFile) {
            return res.status(400).json({ message: 'Payment screenshot is required for verification' });
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

        // 1. Upload Screenshot to Cloudinary
        let screenshotLink = '';
        let uploadErrorDetail = null;

        const filePath = screenshotFile.filepath || screenshotFile.path;
        console.log('Processing screenshot:', filePath);
        console.log('Screenshot file object:', JSON.stringify(screenshotFile, null, 2));

        if (filePath) {
            try {
                const cloudinary = require('cloudinary').v2;

                // Log Cloudinary config status (without exposing secrets)
                console.log('Cloudinary Config Status:', {
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
                    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
                    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
                });

                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });

                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'poppin_bookings',
                    public_id: `payment_${transactionId}_${name.replace(/\s+/g, '_')}_${Date.now()}`,
                    resource_type: 'image',
                });

                screenshotLink = result.secure_url;
                console.log('Cloudinary Upload Success:', screenshotLink);
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                uploadErrorDetail = uploadError.message;
                // Don't return error here, continue with empty link but log the issue
            }
        } else {
            console.error('File path not found on screenshot object:', screenshotFile);
            uploadErrorDetail = 'File path missing';
        }

        // 2. Check Capacity
        const getRows = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:G', // Need columns up to G (TimeSlot is F, Area is E)
        });

        const rows = getRows.data.values || [];

        // Column Indices (0-based) based on append order below:
        // 0: RefId, 1: Name, 2: Phone, 3: Email, 4: Area, 5: Date, 6: TimeSlot
        const AREA_COL = 4;
        const DATE_COL = 5;
        const TIME_COL = 6;

        const bookingsForSlot = rows.filter(row =>
            row[DATE_COL] === date &&
            row[TIME_COL] === timeSlot &&
            row[AREA_COL] === area
        );

        const limit = area === 'Library (Smoking)' ? 4 : 16;

        if (bookingsForSlot.length >= limit) {
            return res.status(400).json({ message: `Sorry, ${area} is fully booked for ${timeSlot} on this date.` });
        }

        // 3. Append new booking
        const nextRowIndex = rows.length ? rows.length + 1 : 1; // +1 because rows.length is 1-based count, but we need next index
        // Actually, rows.length includes header. If header exists (length 1), next is row 2.
        // If rows is empty, next is 1.
        // Ref ID logic:
        const refId = String(rows.length).padStart(3, '0'); // Simple increment
        const status = 'Pending Verification';

        // Columns: Ref ID | Name | Phone | Email | Area | Date | Time | Adults | Children | Comments | Transaction ID | UPI Name | Screenshot | Status
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:N',
            valueInputOption: 'USER_ENTERED',
            includeValuesInResponse: true,
            requestBody: {
                values: [
                    [
                        refId,
                        name,
                        phone,
                        email,
                        area,
                        date,
                        timeSlot,
                        adults,
                        children,
                        comments || '',
                        transactionId || '',
                        upiName || '',
                        screenshotLink,
                        status
                    ],
                ],
            },
        });

        // 4. Send Email
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
                            <p>We have received your booking request.</p>
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
                                <li><strong>Total Amount:</strong> Rs. ${(parseInt(adults) + parseInt(children)) * 1000}</li>
                            </ul>
                        </div>
                    `,
                };
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        res.status(200).json({
            message: 'Booking created successfully',
            data: response.data,
            uploadError: uploadErrorDetail
        });
    } catch (error) {
        console.error('Handler Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
