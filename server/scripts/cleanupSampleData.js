const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

async function cleanupSampleData() {
  try {
    console.log('\n🧹 Cleaning Up Sample Data\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('✅ Connected to MongoDB\n');

    // Get the farmer user
    const farmer = await User.findOne({ email: 'farmer1234@gmail.com' });
    
    if (!farmer) {
      console.log('❌ Farmer user not found!');
      await mongoose.connection.close();
      return;
    }

    console.log(`Farmer: ${farmer.email}`);
    console.log(`Farmer ID: ${farmer._id}\n`);

    // Get all products
    const allProducts = await Product.find({}).sort({ createdAt: 1 });
    console.log(`Total products before cleanup: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
      console.log('✅ No products to clean up!');
      await mongoose.connection.close();
      return;
    }

    // Show all products
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 CURRENT PRODUCTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    allProducts.forEach((product, index) => {
      const seller = product.sellerId?.toString() === farmer._id.toString() ? '✅ Farmer' : '❌ Other';
      console.log(`${index + 1}. ${product.title} (${seller}) - Created: ${product.createdAt}`);
    });
    console.log('');

    // Keep only the 2 oldest farmer products as samples, delete the rest
    const farmerProducts = allProducts.filter(p => 
      p.sellerId?.toString() === farmer._id.toString()
    );

    // Products to keep (2 oldest)
    const productsToKeep = farmerProducts.slice(0, 2);
    const keepIds = productsToKeep.map(p => p._id.toString());

    // Products to delete
    const productsToDelete = allProducts.filter(p => 
      !keepIds.includes(p._id.toString())
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  PRODUCTS TO DELETE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total to delete: ${productsToDelete.length}\n`);

    if (productsToDelete.length > 0) {
      for (const product of productsToDelete) {
        console.log(`Deleting: ${product.title} (ID: ${product._id})`);
        await Product.deleteOne({ _id: product._id });
      }
      console.log(`\n✅ Deleted ${productsToDelete.length} products`);
    } else {
      console.log('No products to delete');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ REMAINING PRODUCTS (Sample Data):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const remainingProducts = await Product.find({})
      .populate('sellerId', 'email')
      .populate('categoryId', 'name')
      .sort({ createdAt: 1 });
    
    console.log(`Total products after cleanup: ${remainingProducts.length}\n`);

    if (remainingProducts.length === 0) {
      console.log('⚠️  All products deleted! Database is empty.');
      console.log('New products will be added when farmers create them.\n');
    } else {
      remainingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   Seller: ${product.sellerId?.email || 'Unknown'}`);
        console.log(`   Category: ${product.categoryId?.name || 'None'}`);
        console.log(`   Price: ₹${product.price}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database cleanup complete!');
    console.log('📝 From now on, only real-time data will be shown.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupSampleData();
