const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');

async function resetFarmerPassword() {
  try {
    console.log('\n🔧 Resetting Farmer Password\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    const farmerEmail = 'farmer1234@gmail.com';
    const newPassword = 'farmer123';

    const farmer = await User.findOne({ email: farmerEmail });
    
    if (!farmer) {
      console.log('❌ Farmer not found!');
      await mongoose.connection.close();
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    farmer.passwordHash = passwordHash;
    await farmer.save();

    console.log('✅ Farmer password updated!\n');
    console.log('Farmer Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${farmerEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log(`ID:       ${farmer._id}`);
    console.log(`Role:     ${farmer.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetFarmerPassword();
