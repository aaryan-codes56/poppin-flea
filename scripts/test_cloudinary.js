// Test Cloudinary configuration using credentials from .env.local.
// The credentials that used to be hard-coded here were committed to Git and
// must be rotated in the Cloudinary console.
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary configuration for cloud:', process.env.CLOUDINARY_CLOUD_NAME || '(missing)');
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping result:', result.status);
  } catch (error) {
    console.error('Cloudinary error:', error.message);
  }
}

testCloudinary();
