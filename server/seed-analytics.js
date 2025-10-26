const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

async function seedCategoriesAndProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farm-marketplace');
    console.log('Connected to MongoDB');
    
    // Check existing categories
    let categories = await Category.find();
    console.log('Existing categories:', categories.length);
    
    if (categories.length === 0) {
      console.log('Creating sample categories...');
      
      const sampleCategories = [
        { name: 'Vegetables', description: 'Fresh vegetables from the farm' },
        { name: 'Fruits', description: 'Fresh seasonal fruits' },
        { name: 'Grains', description: 'Various grains and cereals' },
        { name: 'Seeds', description: 'Seeds for planting' },
        { name: 'Fertilizers', description: 'Organic fertilizers and compost' }
      ];
      
      categories = await Category.insertMany(sampleCategories);
      console.log('Created categories:');
      categories.forEach(cat => console.log('- ', cat.name, '(ID:', cat._id, ')'));
    }
    
    // Update products without categories to have random categories
    const productsWithoutCategory = await Product.find({ categoryId: { $exists: false } });
    console.log('Products without category:', productsWithoutCategory.length);
    
    if (productsWithoutCategory.length > 0) {
      console.log('Assigning categories to products...');
      
      for (const product of productsWithoutCategory) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        await Product.findByIdAndUpdate(product._id, { categoryId: randomCategory._id });
        console.log(`Assigned ${randomCategory.name} to product: ${product.title}`);
      }
    }
    
    console.log('Seeding complete!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedCategoriesAndProducts();