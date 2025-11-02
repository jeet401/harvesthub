const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

async function checkProducts() {
  try {
    console.log('\n🔍 Checking Products in Database\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 ALL PRODUCTS IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allProducts = await Product.find({})
      .populate('sellerId', 'email')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Total products: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log('⚠️  NO PRODUCTS FOUND IN DATABASE!\n');
    } else {
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Seller: ${product.sellerId?.email || 'Unknown'}`);
        console.log(`   Seller ID: ${product.sellerId?._id || product.sellerId}`);
        console.log(`   Category: ${product.categoryId?.name || 'None'}`);
        console.log(`   Price: ₹${product.price}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Status: ${product.status || 'N/A'}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log('');
      });
    }

    // Get products by seller
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PRODUCTS BY SELLER:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Total farmers: ${farmers.length}\n`);
    
    for (const farmer of farmers) {
      const farmerProducts = await Product.find({ sellerId: farmer._id })
        .populate('categoryId', 'name');
      console.log(`Farmer: ${farmer.email}`);
      console.log(`  ID: ${farmer._id}`);
      console.log(`  Products: ${farmerProducts.length}`);
      
      if (farmerProducts.length > 0) {
        farmerProducts.forEach(p => {
          console.log(`    - ${p.title} (₹${p.price}, Stock: ${p.stock})`);
        });
      }
      console.log('');
    }

    // Check raw collection
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗄️  RAW PRODUCTS COLLECTION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const db = mongoose.connection.db;
    const rawProducts = await db.collection('products').find({}).toArray();
    console.log(`Total documents: ${rawProducts.length}\n`);
    
    if (rawProducts.length > 0) {
      console.log('Sample product structure:');
      console.log(JSON.stringify(rawProducts[0], null, 2));
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProducts();
