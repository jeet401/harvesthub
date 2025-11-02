const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

async function assignProductsToFarmer() {
  try {
    console.log('\n🔧 Assigning Products to Farmer\n');
    
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

    console.log(`Found farmer: ${farmer.email}`);
    console.log(`Farmer ID: ${farmer._id}\n`);

    // Find products with null OR non-existent sellerId
    // Get all products
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    // Check which sellers exist
    const sellerIds = [...new Set(allProducts.map(p => p.sellerId?.toString()).filter(Boolean))];
    const existingUsers = await User.find({ _id: { $in: sellerIds } });
    const existingUserIds = existingUsers.map(u => u._id.toString());
    
    // Find orphan products (null sellerId or sellerId not in users collection)
    const orphanProducts = allProducts.filter(p => 
      !p.sellerId || !existingUserIds.includes(p.sellerId.toString())
    );
    
    console.log(`Found ${orphanProducts.length} products without a valid seller\n`);

    if (orphanProducts.length === 0) {
      console.log('✅ All products already have sellers!');
      await mongoose.connection.close();
      return;
    }

    // Assign all orphan products to the farmer
    console.log('Assigning products to farmer...\n');
    
    for (const product of orphanProducts) {
      product.sellerId = farmer._id;
      await product.save();
      console.log(`✅ Assigned "${product.title}" to ${farmer.email}`);
    }

    console.log(`\n✅ Successfully assigned ${orphanProducts.length} products to the farmer!`);

    // Show updated product list
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 FARMER'S PRODUCTS AFTER UPDATE:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const farmerProducts = await Product.find({ sellerId: farmer._id })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Total products: ${farmerProducts.length}\n`);
    
    farmerProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Category: ${product.categoryId?.name || 'None'}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Done! Now refresh your farmer dashboard to see all products.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignProductsToFarmer();
