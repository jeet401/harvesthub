const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Category = require('../src/models/Category');
const Cart = require('../src/models/Cart');

async function viewDatabase() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           HARVESTHUB DATABASE VIEWER                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';
    console.log('📡 Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('✅ Connected successfully!\n');

    // Show all collections
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 AVAILABLE COLLECTIONS IN DATABASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });
    console.log('');

    // USERS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 USERS COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('⚠️  NO USERS FOUND IN DATABASE!\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ├─ ID: ${user._id}`);
        console.log(`   ├─ Role: ${user.role.toUpperCase()}`);
        console.log(`   ├─ Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
        console.log(`   ├─ Password Hash: ${user.passwordHash.substring(0, 20)}...`);
        console.log(`   ├─ Created: ${user.createdAt}`);
        console.log(`   └─ Last Login: ${user.lastLogin || 'Never'}\n`);
      });
    }

    // PROFILES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 PROFILES COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const profiles = await Profile.find().sort({ createdAt: -1 });
    console.log(`Total Profiles: ${profiles.length}\n`);
    
    if (profiles.length === 0) {
      console.log('⚠️  NO PROFILES FOUND IN DATABASE!\n');
    } else {
      for (const profile of profiles) {
        const user = await User.findById(profile.userId);
        console.log(`${profile.name || 'Unnamed'} (${user?.email || 'Unknown'})`);
        console.log(`   ├─ Profile ID: ${profile._id}`);
        console.log(`   ├─ User ID: ${profile.userId}`);
        console.log(`   ├─ Name: ${profile.name || 'Not set'}`);
        console.log(`   ├─ Phone: ${profile.phone || 'Not set'}`);
        console.log(`   ├─ Address: ${profile.address || 'Not set'}`);
        console.log(`   └─ Created: ${profile.createdAt}\n`);
      }
    }

    // PRODUCTS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 PRODUCTS COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const products = await Product.find().sort({ createdAt: -1 }).limit(5);
    const totalProducts = await Product.countDocuments();
    console.log(`Total Products: ${totalProducts} (Showing first 5)\n`);
    
    if (products.length === 0) {
      console.log('⚠️  NO PRODUCTS FOUND IN DATABASE!\n');
    } else {
      for (const product of products) {
        console.log(`${product.title}`);
        console.log(`   ├─ ID: ${product._id}`);
        console.log(`   ├─ Price: ₹${product.price}`);
        console.log(`   ├─ Stock: ${product.stock}`);
        console.log(`   ├─ Status: ${product.status}`);
        console.log(`   ├─ Farmer: ${product.farmer}`);
        console.log(`   └─ Created: ${product.createdAt}\n`);
      }
    }

    // ORDERS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 ORDERS COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Total Orders: ${orders.length}\n`);
    
    if (orders.length === 0) {
      console.log('⚠️  NO ORDERS FOUND IN DATABASE!\n');
    } else {
      orders.forEach((order, index) => {
        console.log(`Order #${index + 1}`);
        console.log(`   ├─ ID: ${order._id}`);
        console.log(`   ├─ Buyer: ${order.buyer}`);
        console.log(`   ├─ Total: ₹${order.totalAmount}`);
        console.log(`   ├─ Status: ${order.status}`);
        console.log(`   ├─ Items: ${order.items?.length || 0}`);
        console.log(`   └─ Created: ${order.createdAt}\n`);
      });
    }

    // CATEGORIES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  CATEGORIES COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const categories = await Category.find().sort({ name: 1 });
    console.log(`Total Categories: ${categories.length}\n`);
    
    if (categories.length === 0) {
      console.log('⚠️  NO CATEGORIES FOUND IN DATABASE!\n');
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   └─ ID: ${cat._id}\n`);
      });
    }

    // CARTS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛍️  CARTS COLLECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const carts = await Cart.find();
    console.log(`Total Carts: ${carts.length}\n`);
    
    if (carts.length === 0) {
      console.log('⚠️  NO CARTS FOUND IN DATABASE!\n');
    } else {
      for (const cart of carts) {
        console.log(`Cart for User: ${cart.userId}`);
        console.log(`   ├─ ID: ${cart._id}`);
        console.log(`   ├─ Items: ${cart.items?.length || 0}`);
        console.log(`   └─ Updated: ${cart.updatedAt}\n`);
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DATABASE SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`Connection URL: ${mongoUri}`);
    console.log(`Total Collections: ${collections.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Profiles: ${profiles.length}`);
    console.log(`Products: ${totalProducts}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Carts: ${carts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

viewDatabase();
