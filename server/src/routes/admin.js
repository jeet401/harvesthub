const express = require('express');
const { adminRequired } = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Notification = require('../models/Notification');

const router = express.Router();

// ==================== USER MANAGEMENT ====================

// Get all users with filtering and pagination
router.get('/users', adminRequired, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get profiles for users
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    
    const usersWithProfiles = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        ...user.toObject(),
        profile: profile || null
      };
    });

    res.json({
      users: usersWithProfiles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID with full details
router.get('/users/:userId', adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const products = await Product.find({ sellerId: user._id }).limit(10);
    const orders = user.role === 'buyer' 
      ? await Order.find({ userId: user._id }).limit(10)
      : await Order.find({ 'items.sellerId': user._id }).limit(10);

    res.json({
      user: {
        ...user.toObject(),
        profile,
        recentProducts: products,
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user role
router.patch('/users/:userId/role', adminRequired, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['buyer', 'farmer', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-passwordHash');

    res.json({ user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Toggle user active status
router.patch('/users/:userId/status', adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ user: { ...user.toObject(), passwordHash: undefined } });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:userId', adminRequired, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete associated data
    await Profile.deleteOne({ userId: user._id });
    await Product.deleteMany({ sellerId: user._id });
    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with filtering
router.get('/products', adminRequired, async (req, res) => {
  try {
    console.log('Admin fetching products with query:', req.query);
    const { status, category, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Exclude ALL products with pending AGMARK verification status
    // They should only appear in "Pending AGMARK Verifications" tab
    // This includes products with or without certificate URL
    query.agmarkVerificationStatus = { $ne: 'pending' };
    
    if (status) {
      query.status = status;
    }
    if (category) {
      query.categoryId = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Product query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .populate('sellerId', 'email role')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    console.log(`Found ${products.length} products, total: ${total}`);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Get products pending AGMARK verification
router.get('/products/agmark/pending', adminRequired, async (req, res) => {
  try {
    // Show ALL products with pending AGMARK verification status
    // This includes products with or without certificate URL uploaded
    const products = await Product.find({
      agmarkVerificationStatus: 'pending'
    })
      .populate('sellerId', 'email role name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Get pending AGMARK products error:', error);
    res.status(500).json({ error: 'Failed to fetch pending AGMARK products' });
  }
});

// Approve/reject product
router.patch('/products/:productId/status', adminRequired, async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'pending', 'rejected'
    
    if (!['active', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { status },
      { new: true }
    ).populate('sellerId', 'email');

    res.json({ product });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Update product AGMARK verification status
router.patch('/products/:productId/agmark', adminRequired, async (req, res) => {
  try {
    const { 
      action,
      rejectionReason 
    } = req.body;

    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "verify" or "reject"' });
    }

    // Get the product first to access its agmarkGrade
    const product = await Product.findById(req.params.productId).populate('sellerId', 'email');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData = {
      agmarkVerificationStatus: action === 'verify' ? 'verified' : 'rejected',
      agmarkVerifiedBy: req.user.sub,
      agmarkVerifiedAt: new Date()
    };

    // If verified, update certification status
    if (action === 'verify') {
      updateData.agmarkCertified = true;
      updateData.agmarkGrade = product.agmarkGrade || 'A'; // Use farmer's requested grade
      updateData.status = 'active'; // Auto-approve product when AGMARK verified
    }

    // If rejected, store reason and unlist the product
    if (action === 'reject') {
      updateData.agmarkCertified = false;
      updateData.agmarkRejectionReason = rejectionReason;
      updateData.status = 'rejected'; // Unlist rejected products
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      updateData,
      { new: true }
    ).populate('sellerId', 'email')
     .populate('agmarkVerifiedBy', 'email');

    // Create notification for farmer
    if (product.sellerId) {
      await Notification.create({
        userId: product.sellerId._id,
        type: action === 'verify' ? 'agmark_verified' : 'agmark_rejected',
        title: action === 'verify' 
          ? '✅ AGMARK Certificate Verified!' 
          : '❌ AGMARK Certificate Rejected',
        message: action === 'verify'
          ? `Your AGMARK certificate for "${product.title}" has been verified with grade ${product.agmarkGrade}. Your product is now active and visible to buyers.`
          : `Your AGMARK certificate for "${product.title}" has been rejected. Reason: ${rejectionReason}. Your product has been unlisted.`,
        relatedProduct: product._id,
        data: {
          productTitle: product.title,
          action,
          grade: product.agmarkGrade,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        }
      });
    }

    // Log the action for farmer notification
    console.log(`AGMARK ${action} for product ${product.title} by admin ${req.user.email}`);
    console.log(`Farmer email: ${product.sellerId?.email}`);
    console.log(`Notification created for farmer`);

    res.json({ 
      product: updatedProduct,
      message: `AGMARK certificate ${action === 'verify' ? 'verified' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Update AGMARK error:', error);
    res.status(500).json({ error: 'Failed to update AGMARK certification' });
  }
});

// Delete product
router.delete('/products/:productId', adminRequired, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders with filtering
router.get('/orders', adminRequired, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'email')
      .populate('items.productId', 'title price')
      .populate('items.sellerId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:orderId', adminRequired, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'email')
      .populate('items.productId')
      .populate('items.sellerId', 'email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin override)
router.patch('/orders/:orderId/status', adminRequired, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate('userId', 'email');

    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==================== ANALYTICS ====================

// Get recent activity
router.get('/analytics/recent-activity', adminRequired, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log('Fetching recent activity with limit:', limit);

    // Get recent users
    const recentUsers = await User.find()
      .select('email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log('Recent users:', recentUsers.length);

    // Get recent products
    const recentProducts = await Product.find()
      .select('title status createdAt')
      .populate('sellerId', 'email')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log('Recent products:', recentProducts.length);

    // Get recent orders
    const recentOrders = await Order.find()
      .select('totalAmount status createdAt')
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log('Recent orders:', recentOrders.length);

    // Format activities with timestamps
    const activities = [];

    // Add user activities
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        icon: 'Users',
        title: `New ${user.role} registration`,
        description: `${user.email} registered as a ${user.role}`,
        timestamp: user.createdAt,
        color: 'blue'
      });
    });

    // Add product activities
    recentProducts.forEach(product => {
      let title = 'New product added';
      let description = `${product.title} by ${product.sellerId?.email || 'Unknown'}`;
      
      if (product.status === 'pending') {
        title = 'Product verification needed';
        description = `${product.title} pending verification`;
      }

      activities.push({
        type: 'product',
        icon: 'Package',
        title,
        description,
        timestamp: product.createdAt,
        color: product.status === 'pending' ? 'yellow' : 'green'
      });
    });

    // Add order activities
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        icon: 'ShoppingCart',
        title: order.totalAmount > 20000 ? 'Large order placed' : 'New order placed',
        description: `₹${order.totalAmount.toLocaleString()} order - ${order.status}`,
        timestamp: order.createdAt,
        color: 'purple'
      });
    });

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    console.log('Total activities:', limitedActivities.length);
    res.json({ activities: limitedActivities });
  } catch (error) {
    console.error('Get recent activity error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch recent activity', details: error.message });
  }
});

// Get platform statistics
router.get('/analytics/stats', adminRequired, async (req, res) => {
  try {
    console.log('Fetching admin stats for user:', req.user);
    
    const [
      totalUsers,
      totalBuyers,
      totalFarmers,
      totalAdmins,
      totalProducts,
      activeProducts,
      pendingProducts,
      pendingAGMARK,
      totalOrders,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'pending' }),
      Product.countDocuments({ agmarkVerificationStatus: 'pending' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' })
    ]);

    // Calculate total revenue
    const orders = await Order.find({ status: { $in: ['delivered', 'shipped'] } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const stats = {
      users: {
        total: totalUsers,
        buyers: totalBuyers,
        farmers: totalFarmers,
        admins: totalAdmins
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        pending: pendingProducts,
        pendingAGMARK
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: totalRevenue,
        currency: 'INR'
      }
    };

    console.log('Admin stats response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', adminRequired, async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'
    
    let groupBy;
    if (period === 'week') {
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'month') {
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else {
      groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ revenueData });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Get category analytics
router.get('/analytics/categories', adminRequired, async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $unwind: '$categoryData'
      },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryData.name' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories: categoryStats });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// ==================== VERIFICATIONS ====================

// Get pending verifications (products needing approval)
router.get('/verifications', adminRequired, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending' })
      .populate('sellerId', 'email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({ verifications: pendingProducts });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

// ==================== SETTINGS ====================

// Get all categories
router.get('/settings/categories', adminRequired, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/settings/categories', adminRequired, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    const category = await Category.create({ name, slug, description });
    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/settings/categories/:categoryId', adminRequired, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { name, slug, description },
      { new: true }
    );

    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/settings/categories/:categoryId', adminRequired, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
