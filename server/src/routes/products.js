const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authRequired } = require('../middleware/auth');

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

// Create a separate route for farmer's own products
router.get('/my-products', authRequired, async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const query = { sellerId: req.user.sub }; // Filter by current user's ID
    
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
    console.error('My products fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch your products' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1, seller } = req.query;
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

    // Filter by specific seller ID (not current user)
    if (seller) {
      query.sellerId = seller;
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
    return res.status(500).json({ 
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new product (farmers only)
router.post('/', authRequired, async (req, res) => {
  try {
    console.log('Creating product with user:', req.user);
    console.log('Request body:', req.body);
    
    const { title, description, price, stock, categoryId, images } = req.body;
    
    // Validate required fields
    if (!title || !price || !stock) {
      return res.status(400).json({ message: 'Title, price, and stock are required' });
    }
    
    // Check if category exists if provided, but don't require it
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        console.log('Category not found, creating product without category');
      }
    }
    
    const product = new Product({
      sellerId: req.user.sub, // Use sub from JWT payload
      title,
      description,
      price,
      stock,
      categoryId: categoryId || null, // Allow null category
      images
    });

    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name')
      .populate('sellerId', 'email');
    
    return res.status(201).json({ product: populatedProduct });
  } catch (error) {
    console.error('Product creation error:', error);
    return res.status(500).json({ 
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

// Update product (farmers only)
router.put('/:id', authRequired, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user.sub) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('categoryId', 'name').populate('sellerId', 'email');
    
    return res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product (farmers only)
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user.sub) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;


