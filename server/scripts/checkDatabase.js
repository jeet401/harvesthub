const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('✅ MongoDB connected\n');

    // Check Users
    console.log('📊 Checking Users Collection:');
    const users = await User.find().limit(10);
    console.log(`Total users found: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt}`);
    });
    console.log('');

    // Check Profiles
    console.log('📊 Checking Profiles Collection:');
    const profiles = await Profile.find().limit(10);
    console.log(`Total profiles found: ${profiles.length}`);
    profiles.forEach(profile => {
      console.log(`- User ID: ${profile.userId} - Name: ${profile.name || 'N/A'}`);
    });
    console.log('');

    // Check for users without profiles
    console.log('⚠️  Checking for users without profiles:');
    const usersWithoutProfiles = await User.find().select('_id email role');
    for (const user of usersWithoutProfiles) {
      const profile = await Profile.findOne({ userId: user._id });
      if (!profile) {
        console.log(`- ${user.email} (${user.role}) - Missing profile!`);
      }
    }
    console.log('');

    // Check database collections
    console.log('📚 Available collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
