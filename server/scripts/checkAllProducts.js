const mongoose = require('mongoose');
const Product = require('../src/models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/farmbyte')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get farmer ID
    const farmerId = '6907133ecc1d7fa44153fd13'; // farmer1234@gmail.com
    
    // Find all products for this farmer
    const products = await Product.find({ sellerId: farmerId }).sort({ createdAt: -1 });
    
    console.log('\n📦 All Products in Database:');
    console.log('============================');
    console.log(`Total: ${products.length} products\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Status: ${product.status || 'N/A'}`);
      console.log(`   Category: ${product.categoryId || 'N/A'}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
