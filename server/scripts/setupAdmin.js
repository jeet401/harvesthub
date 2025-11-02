const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

async function setupAdminAccount() {
  try {
    console.log('🔧 Setting up Admin Account\n');
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('✅ MongoDB connected\n');

    const adminEmail = 'admin@harvesthub.com';
    const adminPassword = 'admin123'; // Simple password for development

    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('⚠️  Admin account already exists. Updating password...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      adminUser.passwordHash = passwordHash;
      adminUser.role = 'admin';
      adminUser.isActive = true;
      await adminUser.save();
      console.log('✅ Admin password updated');
    } else {
      console.log('📝 Creating new admin account...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        email: adminEmail,
        passwordHash: passwordHash,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created');
    }

    // Check/create profile
    let adminProfile = await Profile.findOne({ userId: adminUser._id });
    
    if (!adminProfile) {
      console.log('📝 Creating admin profile...');
      adminProfile = await Profile.create({
        userId: adminUser._id,
        name: 'Admin',
        phone: '',
        address: ''
      });
      console.log('✅ Admin profile created');
    } else {
      console.log('✅ Admin profile already exists');
    }

    console.log('\n🎉 Admin Account Setup Complete!\n');
    console.log('Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`ID:       ${adminUser._id}`);
    console.log(`Active:   ${adminUser.isActive}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 All Users in Database:');
    const allUsers = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    for (const user of allUsers) {
      const profile = await Profile.findOne({ userId: user._id });
      console.log(`${user.role.padEnd(8)} | ${user.email.padEnd(30)} | ${profile?.name || 'N/A'}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupAdminAccount();
