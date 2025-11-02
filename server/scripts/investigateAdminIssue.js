const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');

async function checkAdminUsers() {
  try {
    console.log('\n🔍 Investigating Admin User Visibility Issue\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    // Check ALL users
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ALL USERS IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}\n`);

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Check specifically for admin role
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 FILTERING BY ROLE = "admin":');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Admin users found: ${adminUsers.length}\n`);

    if (adminUsers.length === 0) {
      console.log('❌ NO ADMIN USERS FOUND!\n');
      console.log('This explains why you can\'t see admin data in Compass.\n');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log('');
      });
    }

    // Check by other roles
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 USERS BY ROLE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const buyers = await User.find({ role: 'buyer' });
    const farmers = await User.find({ role: 'farmer' });
    const admins = await User.find({ role: 'admin' });
    
    console.log(`👤 Buyers:  ${buyers.length}`);
    console.log(`🌾 Farmers: ${farmers.length}`);
    console.log(`👑 Admins:  ${admins.length}`);
    console.log('');

    // Check if any user has admin-like properties but different role value
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 CHECKING FOR MISNAMED ROLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allRoles = await User.distinct('role');
    console.log('Unique roles in database:', allRoles);
    console.log('');

    // Check profiles for admin users
    if (adminUsers.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 ADMIN PROFILES:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const admin of adminUsers) {
        const profile = await Profile.findOne({ userId: admin._id });
        console.log(`Admin: ${admin.email}`);
        if (profile) {
          console.log(`  ✅ Profile exists:`);
          console.log(`     Name: ${profile.name || 'Not set'}`);
          console.log(`     Phone: ${profile.phone || 'Not set'}`);
          console.log(`     ID: ${profile._id}`);
        } else {
          console.log(`  ❌ NO PROFILE FOUND`);
        }
        console.log('');
      }
    }

    // Direct query on raw collection
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗄️  RAW COLLECTION QUERY (bypassing Mongoose):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const rawUsers = await usersCollection.find({}).toArray();
    
    console.log(`Total documents in 'users' collection: ${rawUsers.length}\n`);
    
    rawUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (role: "${user.role}")`);
    });
    console.log('');

    const rawAdmins = await usersCollection.find({ role: 'admin' }).toArray();
    console.log(`Documents with role="admin": ${rawAdmins.length}\n`);

    await mongoose.connection.close();
    console.log('✅ Investigation complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminUsers();
