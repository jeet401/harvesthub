const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

async function updateProductStatus() {
  try {
    console.log('\n🔧 Updating Product Status Field\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    // Update all products without status to have 'pending' status
    const result = await Product.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'pending' } }
    );

    console.log(`Updated ${result.modifiedCount} products with status='pending'`);

    // Show all products with their status
    const products = await Product.find({})
      .populate('sellerId', 'email')
      .sort({ createdAt: -1 });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 ALL PRODUCTS WITH STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Seller: ${product.sellerId?.email || 'Unknown'}`);
      console.log(`   Status: ${product.status || 'N/A'}`);
      console.log(`   Price: ₹${product.price} | Stock: ${product.stock}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Product status update complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductStatus();
