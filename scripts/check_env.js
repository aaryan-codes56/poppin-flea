const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('Checking .env.local for Cloudinary variables:\n');

const lines = envContent.split('\n');
let foundCloudName = false;
let foundApiKey = false;
let foundApiSecret = false;

lines.forEach(line => {
    if (line.startsWith('CLOUDINARY_CLOUD_NAME')) {
        console.log('✅ CLOUDINARY_CLOUD_NAME found:', line);
        foundCloudName = true;
    }
    if (line.startsWith('CLOUDINARY_API_KEY')) {
        console.log('✅ CLOUDINARY_API_KEY found:', line);
        foundApiKey = true;
    }
    if (line.startsWith('CLOUDINARY_API_SECRET')) {
        console.log('✅ CLOUDINARY_API_SECRET found:', line);
        foundApiSecret = true;
    }
});

if (!foundCloudName) console.log('❌ CLOUDINARY_CLOUD_NAME is MISSING');
if (!foundApiKey) console.log('❌ CLOUDINARY_API_KEY is MISSING');
if (!foundApiSecret) console.log('❌ CLOUDINARY_API_SECRET is MISSING');

console.log('\n--- Full .env.local content (check for typos) ---');
console.log(envContent);
