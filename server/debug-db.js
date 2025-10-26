require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const Profile = require('./src/models/Profile');

async function debugDatabase() {
  console.log('Starting debug...');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    console.log('Attempting to connect to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);
    
    const orderCount = await Order.countDocuments();
    console.log('Total orders:', orderCount);
    
    const userCount = await User.countDocuments();
    console.log('Total users:', userCount);
    
    const profileCount = await Profile.countDocuments();
    console.log('Total profiles:', profileCount);
    
    if (orderCount > 0) {
      const sampleOrder = await Order.findOne().populate('items.sellerId', 'email role');
      console.log('\nSample order structure:');
      console.log('- Order ID:', sampleOrder._id);
      console.log('- Items count:', sampleOrder.items?.length);
      console.log('- First item seller:', sampleOrder.items?.[0]?.sellerId);
      console.log('- Full order items:', JSON.stringify(sampleOrder.items, null, 2));
    }
    
    if (profileCount > 0) {
      const sampleProfile = await Profile.findOne();
      console.log('\nSample profile:', JSON.stringify(sampleProfile, null, 2));
    }
    
    // Find users with farmer role
    const farmers = await User.find({role: 'farmer'}).limit(3);
    console.log('\nSample farmers:', farmers.map(f => ({id: f._id, email: f.email})));
    
    // Check if any profiles exist for farmers
    if (farmers.length > 0) {
      const farmerIds = farmers.map(f => f._id);
      const farmerProfiles = await Profile.find({userId: {$in: farmerIds}});
      console.log('\nFarmer profiles:', JSON.stringify(farmerProfiles, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugDatabase();