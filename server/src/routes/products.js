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
    
    // Only show active products to buyers (not pending or rejected)
    const query = { status: 'active' };
    
    console.log('=== Products GET Request ===');
    console.log('Query params:', { category, search, limit, page, seller });
    
    // First, let's check total products in database
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const rejectedProducts = await Product.countDocuments({ status: 'rejected' });
    
    console.log('Database stats:');
    console.log(`  Total products: ${totalProducts}`);
    console.log(`  Active: ${activeProducts}`);
    console.log(`  Pending: ${pendingProducts}`);
    console.log(`  Rejected: ${rejectedProducts}`);
    
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
    
    console.log('Final query:', JSON.stringify(query));
    
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('sellerId', 'email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`Returning ${products.length} products`);
    console.log('=== End Products Request ===\n');
    
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
    
    const { 
      title, description, price, stock, categoryId, images,
      // AGMARK fields
      agmarkCertificateUrl, agmarkCertificateNumber, agmarkGrade,
      // Additional fields
      unit, location, harvestDate, expiryDate
    } = req.body;
    
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
    
    const productData = {
      sellerId: req.user.sub, // Use sub from JWT payload
      title,
      description,
      price,
      stock,
      categoryId: categoryId || null, // Allow null category
      images,
      unit: unit || 'kg',
      location,
      harvestDate,
      expiryDate,
      status: 'pending' // Default to pending - products need AGMARK verification to be listed
    };

    // If AGMARK certificate provided, set verification status to pending
    // Product will be activated only after admin verifies AGMARK certificate
    if (agmarkCertificateUrl) {
      productData.agmarkCertificateUrl = agmarkCertificateUrl;
      productData.agmarkCertificateNumber = agmarkCertificateNumber;
      productData.agmarkGrade = agmarkGrade || 'Not Graded';
      productData.agmarkVerificationStatus = 'pending';
      productData.agmarkCertified = false; // Admin needs to verify first
      // Product stays pending until AGMARK is verified
    }

    const product = new Product(productData);

    await product.save();
    
    console.log('Product created successfully with status:', product.status);
    
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
    console.log('=== Fetching product by ID ===');
    console.log('Product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('sellerId', 'email');
    
    console.log('Product found:', product ? product.title : 'null');
    console.log('Product status:', product?.status);
    
    if (!product) {
      console.log('Product not found in database');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If product is not active, only allow the seller or admin to view it
    // For buyers, they should only see active products
    if (product.status !== 'active') {
      console.log('Product is not active, checking authentication...');
      // Check if user is authenticated and is the owner
      const token = req.cookies.access_token || req.cookies.token;
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
          console.log('Decoded user:', decoded.sub, 'Role:', decoded.role);
          console.log('Product seller:', product.sellerId._id.toString());
          
          // Allow if user is the seller or an admin
          if (decoded.sub !== product.sellerId._id.toString() && decoded.role !== 'admin') {
            console.log('User is not the owner or admin');
            return res.status(404).json({ message: 'Product not found' });
          }
          console.log('User authorized to view this product');
        } catch (err) {
          console.error('Token verification error:', err);
          return res.status(404).json({ message: 'Product not found' });
        }
      } else {
        // No token, user is not authenticated, don't show non-active products
        console.log('No token found, not showing non-active product');
        return res.status(404).json({ message: 'Product not found' });
      }
    }
    
    console.log('Returning product:', product.title);
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
    console.log('=== Delete Product Request ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user.sub);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product seller ID:', product.sellerId.toString());
    
    if (product.sellerId.toString() !== req.user.sub) {
      console.log('User not authorized to delete this product');
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    console.log('Product deleted successfully:', product.title);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;


