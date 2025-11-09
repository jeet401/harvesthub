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
      { name: 'Grains & Cereals', slug: 'grains-cereals' },
      { name: 'Vegetables', slug: 'vegetables' },
      { name: 'Fruits', slug: 'fruits' },
      { name: 'Pulses & Legumes', slug: 'pulses-legumes' },
      { name: 'Spices & Herbs', slug: 'spices-herbs' },
      { name: 'Seeds', slug: 'seeds' },
      { name: 'Organic Products', slug: 'organic-products' },
      { name: 'Dairy Products', slug: 'dairy-products' },
      { name: 'Nuts & Dry Fruits', slug: 'nuts-dry-fruits' },
      { name: 'Flowers', slug: 'flowers' }
    ]);
    console.log('Created categories:', categories.length);

    // Create users (farmers and buyer)
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { email: 'demofarmer@example.com', passwordHash, role: 'farmer' },
      { email: 'buyer@example.com', passwordHash, role: 'buyer' },
    ]);
    console.log('Created users:', users.length);

    // Create profiles
    await Profile.insertMany([
      { userId: users[0]._id, name: 'Demo Farmer', phone: '9876543210', address: 'Maharashtra, India' },
      { userId: users[1]._id, name: 'Buyer User', phone: '9876543213', address: 'Bangalore, Karnataka' },
    ]);
    console.log('Created profiles');

    // Create products - Only Tomatoes and Apples
    const products = await Product.insertMany([
      {
        sellerId: users[0]._id,
        categoryId: categories[1]._id, // Vegetables
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes grown in our farm',
        price: 80,
        stock: 50,
        images: ['/tomatoes.jpeg'],
        status: 'active',
        unit: 'kg',
        location: 'Maharashtra, India',
        agmarkCertified: true,
        agmarkGrade: 'A+',
        agmarkCertificateNumber: 'AG-MH-2024-12345',
        agmarkVerificationStatus: 'verified',
        agmarkVerifiedAt: new Date()
      },
      {
        sellerId: users[0]._id,
        categoryId: categories[2]._id, // Fruits
        title: 'Organic Apples',
        description: 'Fresh red apples from Kashmir',
        price: 120,
        stock: 30,
        images: ['/apples.webp'],
        status: 'active',
        unit: 'kg',
        location: 'Kashmir, India',
        agmarkCertified: true,
        agmarkGrade: 'A+',
        agmarkCertificateNumber: 'AG-KS-2024-67890',
        agmarkVerificationStatus: 'verified',
        agmarkVerifiedAt: new Date()
      },
    ]);
    console.log('Created products:', products.length);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Demo Farmer: demofarmer@example.com / password123');
    console.log('Buyer: buyer@example.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
