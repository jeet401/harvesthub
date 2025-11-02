const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

async function checkAdminData() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('✅ MongoDB connected\n');

    // Get admin user with profile
    console.log('👑 Admin User Details:');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found in database!');
      await mongoose.connection.close();
      return;
    }

    console.log('Admin User:');
    console.log(`- ID: ${adminUser._id}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    console.log(`- Active: ${adminUser.isActive}`);
    console.log(`- Created: ${adminUser.createdAt}`);
    console.log(`- Last Login: ${adminUser.lastLogin || 'Never'}`);
    console.log('');

    // Get admin profile
    const adminProfile = await Profile.findOne({ userId: adminUser._id });
    
    if (!adminProfile) {
      console.log('⚠️  Admin profile not found! Creating one...');
      const defaultName = adminUser.email.split('@')[0].charAt(0).toUpperCase() + adminUser.email.split('@')[0].slice(1);
      const newProfile = await Profile.create({ 
        userId: adminUser._id, 
        name: defaultName 
      });
      console.log('✅ Admin profile created:', newProfile);
    } else {
      console.log('Admin Profile:');
      console.log(`- Name: ${adminProfile.name || 'Not set'}`);
      console.log(`- Phone: ${adminProfile.phone || 'Not set'}`);
      console.log(`- Address: ${adminProfile.address || 'Not set'}`);
    }
    console.log('');

    // Get all users with their profiles
    console.log('👥 All Users with Profiles:');
    const allUsers = await User.find().sort({ createdAt: -1 });
    
    for (const user of allUsers) {
      const profile = await Profile.findOne({ userId: user._id });
      console.log(`\n${user.role.toUpperCase()}: ${user.email}`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - Profile Name: ${profile?.name || 'N/A'}`);
      console.log(`  - Active: ${user.isActive}`);
      console.log(`  - Created: ${user.createdAt}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Admin data check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminData();
