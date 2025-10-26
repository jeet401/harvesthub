const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');
const Category = require('./models/Category');

async function seedOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a buyer user
    let buyer = await User.findOne({ role: 'buyer' });
    if (!buyer) {
      buyer = await User.create({
        email: 'buyer@test.com',
        password: 'password123',
        role: 'buyer'
      });
      console.log('Created buyer user');
    }

    // Find or create a farmer user
    let farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      farmer = await User.create({
        email: 'farmer@test.com',
        password: 'password123',
        role: 'farmer'
      });
      console.log('Created farmer user');
    }

    // Create profile for farmer
    let farmerProfile = await Profile.findOne({ userId: farmer._id });
    if (!farmerProfile) {
      farmerProfile = await Profile.create({
        userId: farmer._id,
        name: 'Fresh Farm Store',
        phone: '+1234567890',
        address: '123 Farm Road'
      });
      console.log('Created farmer profile');
    }

    // Find or create a category
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: 'Vegetables',
        description: 'Fresh vegetables'
      });
      console.log('Created category');
    }

    // Find or create a product
    let product = await Product.findOne();
    if (!product) {
      product = await Product.create({
        title: 'Fresh Tomatoes',
        description: 'Organic tomatoes',
        price: 50,
        stock: 100,
        categoryId: category._id,
        farmerId: farmer._id,
        images: []
      });
      console.log('Created product');
    }

    // Create test orders
    const testOrders = [
      {
        userId: buyer._id,
        items: [{
          productId: product._id,
          sellerId: farmer._id,
          quantity: 2,
          price: 50,
          totalPrice: 100
        }],
        subtotal: 100,
        totalAmount: 100,
        status: 'delivered',
        paymentStatus: 'completed'
      },
      {
        userId: buyer._id,
        items: [{
          productId: product._id,
          sellerId: farmer._id,
          quantity: 1,
          price: 50,
          totalPrice: 50
        }],
        subtotal: 50,
        totalAmount: 50,
        status: 'shipped',
        paymentStatus: 'completed'
      }
    ];

    for (const orderData of testOrders) {
      const existingOrder = await Order.findOne({ 
        userId: orderData.userId,
        totalAmount: orderData.totalAmount 
      });
      
      if (!existingOrder) {
        await Order.create(orderData);
        console.log(`Created order with total: ${orderData.totalAmount}`);
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedOrders();