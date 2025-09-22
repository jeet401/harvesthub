const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    return res.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const query = {};
    
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) query.categoryId = categoryDoc._id;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('sellerId', 'email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    return res.json({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('sellerId', 'email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    return res.json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});

module.exports = router;


