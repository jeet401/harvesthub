const mongoose = require('mongoose');
const Category = require('./src/models/Category');

const categories = [
  { _id: '66f8a1b2e4b9c2a1f3d4e5f6', name: 'Grains & Cereals' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5f7', name: 'Vegetables' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5f8', name: 'Fruits' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5f9', name: 'Pulses & Legumes' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5fa', name: 'Spices & Herbs' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5fb', name: 'Seeds' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5fc', name: 'Organic Products' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5fd', name: 'Dairy Products' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5fe', name: 'Nuts & Dry Fruits' },
  { _id: '66f8a1b2e4b9c2a1f3d4e5ff', name: 'Flowers' }
];

async function seedCategories() {
  try {
    // Connect to MongoDB (using same connection as server)
    await mongoose.connect('mongodb://127.0.0.1:27017/farmbyte');

    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully:', categories.length);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;