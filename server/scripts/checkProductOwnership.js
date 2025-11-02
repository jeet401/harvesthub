const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/farmbyte')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    console.log('📦 All Products in Database:');
    console.log('============================\n');
    
    const products = await Product.find({}).populate('sellerId', 'email role').sort({ createdAt: -1 });
    
    console.log(`Total: ${products.length} products\n`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const seller = product.sellerId;
      
      console.log(`${i + 1}. ${product.title}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Seller ID: ${product.sellerId._id || product.sellerId}`);
      console.log(`   Seller Email: ${seller?.email || 'N/A'}`);
      console.log(`   Seller Role: ${seller?.role || 'N/A'}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    }
    
    // Group by seller
    const bySeller = {};
    products.forEach(p => {
      const sellerId = p.sellerId?._id?.toString() || p.sellerId?.toString();
      if (!bySeller[sellerId]) {
        bySeller[sellerId] = {
          email: p.sellerId?.email || 'Unknown',
          products: []
        };
      }
      bySeller[sellerId].products.push(p.title);
    });
    
    console.log('\n📊 Products by Seller:');
    console.log('=====================\n');
    
    Object.entries(bySeller).forEach(([sellerId, data]) => {
      console.log(`Seller: ${data.email}`);
      console.log(`ID: ${sellerId}`);
      console.log(`Products (${data.products.length}):`);
      data.products.forEach(title => console.log(`  • ${title}`));
      console.log('');
    });
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
