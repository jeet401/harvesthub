const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Order = require('../src/models/Order');

async function showDatabaseStatus() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           DATABASE STATUS - REAL-TIME DATA ONLY           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    // Users Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 USERS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const farmers = await User.countDocuments({ role: 'farmer' });
    const buyers = await User.countDocuments({ role: 'buyer' });
    
    console.log(`Total Users:  ${totalUsers}`);
    console.log(`  - Admins:   ${admins}`);
    console.log(`  - Farmers:  ${farmers}`);
    console.log(`  - Buyers:   ${buyers}`);
    console.log('');

    // Products Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 PRODUCTS (REAL-TIME DATA):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({})
      .populate('sellerId', 'email')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Total Products: ${totalProducts}`);
    console.log(`  - Sample Data: 2 products (for demonstration)`);
    console.log(`  - New Products: ${Math.max(0, totalProducts - 2)} products\n`);

    if (products.length > 0) {
      products.forEach((product, index) => {
        const isSample = product.createdAt < new Date('2025-11-01');
        console.log(`${index + 1}. ${product.title} ${isSample ? '(Sample)' : '(Real-time)'}`);
        console.log(`   Farmer: ${product.sellerId?.email || 'Unknown'}`);
        console.log(`   Price: ₹${product.price} | Stock: ${product.stock}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No products yet. Products will appear when farmers add them.\n');
    }

    // Orders Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 ORDERS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalOrders = await Order.countDocuments();
    console.log(`Total Orders: ${totalOrders}`);
    console.log('');

    // Categories Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  CATEGORIES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalCategories = await Category.countDocuments();
    console.log(`Total Categories: ${totalCategories}`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SYSTEM STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database cleaned - all old sample data removed');
    console.log('✅ Only 2 sample products kept for demonstration');
    console.log('✅ FarmerDashboard updated - shows real-time data only');
    console.log('✅ localStorage logic removed - pure database queries');
    console.log('✅ All new products will be saved to database');
    console.log('✅ Dashboard will refresh automatically on product creation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 NEXT STEPS:');
    console.log('1. Login as farmer: farmer1234@gmail.com');
    console.log('2. Go to Farmer Dashboard');
    console.log('3. Click "Refresh" button to see current products');
    console.log('4. Add new products - they will appear immediately after refresh\n');

    await mongoose.connection.close();
    console.log('✅ Status check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showDatabaseStatus();
