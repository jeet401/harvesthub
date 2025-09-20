const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Profile = require('./models/Profile');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Fruits', slug: 'fruits' },
      { name: 'Vegetables', slug: 'vegetables' },
      { name: 'Seeds', slug: 'seeds' },
      { name: 'Fertilizers', slug: 'fertilizers' },
    ]);
    console.log('Created categories:', categories.length);

    // Create users (farmers)
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { email: 'farmer1@example.com', passwordHash, role: 'farmer' },
      { email: 'farmer2@example.com', passwordHash, role: 'farmer' },
      { email: 'farmer3@example.com', passwordHash, role: 'farmer' },
      { email: 'buyer@example.com', passwordHash, role: 'buyer' },
    ]);
    console.log('Created users:', users.length);

    // Create profiles
    await Profile.insertMany([
      { userId: users[0]._id, name: 'John Doe', phone: '9876543210', address: 'Mumbai, Maharashtra' },
      { userId: users[1]._id, name: 'Jane Smith', phone: '9876543211', address: 'Delhi, NCR' },
      { userId: users[2]._id, name: 'Mike Johnson', phone: '9876543212', address: 'Pune, Maharashtra' },
      { userId: users[3]._id, name: 'Buyer User', phone: '9876543213', address: 'Bangalore, Karnataka' },
    ]);
    console.log('Created profiles');

    // Create products
    const products = await Product.insertMany([
      {
        sellerId: users[0]._id,
        categoryId: categories[1]._id, // Vegetables
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes grown in our farm',
        price: 80,
        stock: 50,
        images: ['/fresh-vegetables-tomatoes-carrots-onions.png'],
      },
      {
        sellerId: users[1]._id,
        categoryId: categories[0]._id, // Fruits
        title: 'Organic Apples',
        description: 'Fresh red apples from Kashmir',
        price: 120,
        stock: 30,
        images: ['/fresh-colorful-fruits-apples-oranges-bananas.png'],
      },
      {
        sellerId: users[2]._id,
        categoryId: categories[2]._id, // Seeds
        title: 'Wheat Seeds',
        description: 'High quality wheat seeds for farming',
        price: 45,
        stock: 100,
        images: ['/various-seeds-packets-wheat-rice-vegetable-seeds.png'],
      },
      {
        sellerId: users[0]._id,
        categoryId: categories[3]._id, // Fertilizers
        title: 'Organic Fertilizer',
        description: 'Natural compost fertilizer for healthy crops',
        price: 200,
        stock: 25,
        images: ['/organic-fertilizer-bags-compost-natural-farming.png'],
      },
      {
        sellerId: users[1]._id,
        categoryId: categories[1]._id, // Vegetables
        title: 'Carrots',
        description: 'Fresh orange carrots',
        price: 60,
        stock: 40,
        images: ['/fresh-vegetables-tomatoes-carrots-onions.png'],
      },
      {
        sellerId: users[2]._id,
        categoryId: categories[0]._id, // Fruits
        title: 'Bananas',
        description: 'Sweet yellow bananas',
        price: 40,
        stock: 60,
        images: ['/fresh-colorful-fruits-apples-oranges-bananas.png'],
      },
    ]);
    console.log('Created products:', products.length);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Farmer 1: farmer1@example.com / password123');
    console.log('Farmer 2: farmer2@example.com / password123');
    console.log('Buyer: buyer@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
