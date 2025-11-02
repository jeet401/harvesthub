// Script to add default categories to MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';

// Default categories
const defaultCategories = [
  { name: 'Grains & Cereals', slug: 'grains-cereals', description: 'Rice, Wheat, Barley, Oats, etc.' },
  { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables and greens' },
  { name: 'Fruits', slug: 'fruits', description: 'Fresh seasonal fruits' },
  { name: 'Pulses & Legumes', slug: 'pulses-legumes', description: 'Lentils, beans, chickpeas, etc.' },
  { name: 'Spices & Herbs', slug: 'spices-herbs', description: 'Fresh and dried spices' },
  { name: 'Seeds', slug: 'seeds', description: 'Agricultural and planting seeds' },
  { name: 'Organic Products', slug: 'organic-products', description: 'Certified organic produce' },
  { name: 'Dairy Products', slug: 'dairy-products', description: 'Milk, cheese, butter, etc.' },
  { name: 'Nuts & Dry Fruits', slug: 'nuts-dry-fruits', description: 'Almonds, cashews, raisins, etc.' },
  { name: 'Flowers', slug: 'flowers', description: 'Fresh flowers and ornamental plants' }
];

async function addCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;

    // Drop the slug index if it exists
    try {
      await db.collection('categories').dropIndex('slug_1');
      console.log('🗑️  Dropped slug index');
    } catch (error) {
      console.log('ℹ️  No slug index to drop (this is fine)');
    }

    // Clear existing categories
    const deleteResult = await db.collection('categories').deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing categories`);

    // Insert default categories
    const insertResult = await db.collection('categories').insertMany(defaultCategories);
    console.log(`✅ Added ${insertResult.insertedCount} categories:`);
    
    defaultCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCategories();
