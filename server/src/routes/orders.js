const router = require('express').Router();
const Order = require('../models/Order');
const { authRequired } = require('../middleware/auth');

// Get orders for buyers
router.get('/', authRequired, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user.sub);
    const orders = await Order.find({ userId: req.user.sub })
      .populate('items.productId', 'title name images price imageUrl')
      .populate('items.sellerId', 'email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders`);
    return res.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get orders for farmers (their products that were ordered)
router.get('/farmer', authRequired, async (req, res) => {
  try {
    console.log('Fetching farmer orders for user:', req.user.sub);
    
    // Get ALL orders and filter in code to ensure we don't miss any due to ObjectId issues
    const allOrders = await Order.find({})
      .populate('userId', 'email name')
      .populate('items.productId', 'title name images price imageUrl')
      .populate('items.sellerId', 'email name')
      .sort({ createdAt: -1 });
    
    console.log(`Total orders in database: ${allOrders.length}`);
    
    // Filter orders that have items belonging to this farmer
    const farmerOrders = [];
    
    for (const order of allOrders) {
      const farmerItems = order.items.filter(item => {
        // Convert both IDs to strings for comparison
        const itemSellerId = item.sellerId && item.sellerId._id 
          ? item.sellerId._id.toString() 
          : item.sellerId ? item.sellerId.toString() : null;
        
        const currentUserId = req.user.sub.toString();
        
        console.log(`Comparing sellerId: ${itemSellerId} with userId: ${currentUserId}`);
        
        return itemSellerId === currentUserId;
      });
      
      if (farmerItems.length > 0) {
        farmerOrders.push({
          ...order.toObject(),
          items: farmerItems,
          totalItems: farmerItems.length,
          buyer: order.userId?.email || 'Unknown Buyer'
        });
      }
    }
    
    console.log(`Found ${farmerOrders.length} orders for farmer ${req.user.sub}`);
    
    if (farmerOrders.length === 0) {
      console.log('No orders found. This could mean:');
      console.log('1. No one has ordered from this farmer yet');
      console.log('2. User ID mismatch between products and orders');
      console.log('3. User is not logged in as a farmer who has products');
    }
    
    return res.json({ orders: farmerOrders });
  } catch (error) {
    console.error('Farmer orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch farmer orders' });
  }
});

// Get single order by ID
router.get('/:id', authRequired, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'title name images price imageUrl')
      .populate('items.sellerId', 'email name')
      .populate('userId', 'email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user has access to this order
    if (order.userId._id.toString() !== req.user.sub && 
        !order.items.some(item => item.sellerId._id.toString() === req.user.sub)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json({ order });
  } catch (error) {
    console.error('Single order fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update order status (farmers only)
router.put('/:id/status', authRequired, async (req, res) => {
  try {
    console.log('Update order status request:', {
      orderId: req.params.id,
      userId: req.user.sub,
      body: req.body
    });
    
    const { status, progress, trackingId } = req.body;
    
    const order = await Order.findById(req.params.id).populate('items.sellerId', '_id email name');
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order found:', {
      orderId: order._id,
      items: order.items.map(item => ({
        sellerId: item.sellerId,
        productId: item.productId
      }))
    });
    
    // Check if farmer owns any items in this order
    const hasItems = order.items.some(item => {
      const sellerId = item.sellerId._id ? item.sellerId._id.toString() : item.sellerId.toString();
      const sellerIdMatch = sellerId === req.user.sub;
      console.log('Checking item:', {
        itemSellerId: sellerId,
        userSub: req.user.sub,
        match: sellerIdMatch
      });
      return sellerIdMatch;
    });
    
    if (!hasItems) {
      console.log('User not authorized to update this order');
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    console.log('Updating order with:', { status, progress, trackingId });
    
    if (status) order.status = status;
    if (progress !== undefined) order.progress = progress;
    if (trackingId) order.trackingId = trackingId;
    
    await order.save();
    console.log('Order updated successfully');
    
    return res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Order status update error:', error);
    return res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// Mark order as received (buyers only)
router.put('/:id/received', authRequired, async (req, res) => {
  try {
    console.log('Mark order as received request:', {
      orderId: req.params.id,
      userId: req.user.sub
    });
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if this is the buyer who placed the order
    if (order.userId.toString() !== req.user.sub) {
      console.log('User not authorized to mark this order as received');
      return res.status(403).json({ message: 'Not authorized to mark this order as received' });
    }
    
    // Update order status to delivered and set progress to 100%
    order.status = 'delivered';
    order.progress = 100;
    order.actualDelivery = new Date();
    
    await order.save();
    console.log('Order marked as received successfully');
    
    return res.json({ message: 'Order marked as received successfully', order });
  } catch (error) {
    console.error('Mark order as received error:', error);
    return res.status(500).json({ message: 'Failed to mark order as received', error: error.message });
  }
});

// Debug endpoint to check products and their sellers
router.get('/debug/products-sellers', authRequired, async (req, res) => {
  try {
    const Product = require('../models/Product');
    
    const products = await Product.find({}).populate('sellerId', 'email role').lean();
    
    console.log('=== PRODUCTS AND SELLERS DEBUG ===');
    products.forEach(product => {
      console.log(`Product: ${product.title}`);
      console.log(`  ID: ${product._id}`);
      console.log(`  Seller ID: ${product.sellerId?._id}`);
      console.log(`  Seller Email: ${product.sellerId?.email}`);
      console.log(`  Current User: ${req.user.sub}`);
      console.log(`  Match: ${product.sellerId?._id?.toString() === req.user.sub}`);
      console.log('---');
    });
    
    return res.json({
      currentUser: req.user.sub,
      products: products.map(p => ({
        id: p._id,
        title: p.title,
        sellerId: p.sellerId?._id,
        sellerEmail: p.sellerId?.email,
        isMyProduct: p.sellerId?._id?.toString() === req.user.sub
      }))
    });
  } catch (error) {
    console.error('Debug products error:', error);
    return res.status(500).json({ message: 'Debug failed', error: error.message });
  }
});

module.exports = router;


