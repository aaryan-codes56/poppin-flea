// Test Cloudinary configuration
const cloudinary = require('cloudinary').v2;

// Configure with the credentials
cloudinary.config({
    cloud_name: 'dma9galgd',
    api_key: '456435543249879',
    api_secret: '60x_1SBIs4JsSTAuEtkzbmM38JM',
});

async function testCloudinary() {
    try {
        console.log('Testing Cloudinary configuration...');
        console.log('Cloud name:', cloudinary.config().cloud_name);

        // Try to ping/test the config by getting account usage
        const result = await cloudinary.api.ping();
        console.log('Cloudinary ping result:', result);
        console.log('\n✅ Cloudinary is configured correctly!');
    } catch (error) {
        console.error('❌ Cloudinary error:', error.message);
        console.error('Full error:', error);
    }
}

testCloudinary();
