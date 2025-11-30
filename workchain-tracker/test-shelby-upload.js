// Test Shelby upload manually
const { WorkDatabase } = require('./src/main/database');
const { ShelbyService } = require('./src/main/shelby.service');

async function testShelbyUpload() {
    console.log('=== Testing Shelby Upload ===\n');

    // Get database
    const db = new WorkDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Get today's summary
    const summary = db.getDailySummary(today);

    if (!summary) {
        console.log('❌ No summary found for today:', today);
        return;
    }

    console.log('📊 Today\'s Summary:');
    console.log(`  Date: ${summary.date}`);
    console.log(`  Total Active Minutes: ${summary.totalActiveMinutes}`);
    console.log(`  Coding: ${summary.codingMinutes}m`);
    console.log(`  Browser: ${summary.browserMinutes}m`);
    console.log(`  Current Blob ID: ${summary.shelbyBlobId || 'none'}\n`);

    // Create Shelby service
    console.log('🔧 Initializing Shelby service...');
    const shelbyService = new ShelbyService();

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try upload
    console.log('\n📤 Uploading to Shelby...');
    try {
        const blobId = await shelbyService.uploadDailySummary(summary);
        console.log(`✅ Upload successful!`);
        console.log(`   Blob ID: ${blobId}`);

        // Update database
        summary.shelbyBlobId = blobId;
        db.updateDailySummary(summary.date, summary);
        console.log(`✅ Database updated with blob ID`);
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }

    db.close();
}

testShelbyUpload().catch(console.error);
