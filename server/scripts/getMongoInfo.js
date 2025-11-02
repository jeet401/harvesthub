const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function getConnectionInfo() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║       MONGODB CONNECTION INFO FOR COMPASS                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    console.log('📡 Connection String from .env:');
    console.log(`   ${mongoUri}\n`);
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected successfully!\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 USE THESE DETAILS IN MONGODB COMPASS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Connection String: ${mongoUri}`);
    console.log(`Database Name:     ${dbName}`);
    console.log(`Host:              127.0.0.1 (localhost)`);
    console.log(`Port:              27017`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📚 Collections in this database:');
    console.log(`   Total: ${collections.length}\n`);
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name.padEnd(20)} - ${count} document(s)`);
    }
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 STEPS TO VIEW IN COMPASS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Open MongoDB Compass');
    console.log(`2. Connect to: ${mongoUri}`);
    console.log(`3. Select database: "${dbName}"`);
    console.log('4. Click on "users" collection to see all users');
    console.log('5. Click on "profiles" collection to see all profiles');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure MongoDB is running!');
    console.log('   Check with: brew services list | grep mongodb');
    process.exit(1);
  }
}

getConnectionInfo();
