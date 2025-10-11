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
    const orders = await Order.find({ 'items.sellerId': req.user.sub })
      .populate('userId', 'email')
      .populate('items.productId', 'title name images price imageUrl')
      .populate('items.sellerId', 'email name')
      .sort({ createdAt: -1 });
    
    // Filter items that belong to this farmer
    const farmerOrders = orders.map(order => {
      const farmerItems = order.items.filter(item => 
        item.sellerId.toString() === req.user.sub
      );
      
      return {
        ...order.toObject(),
        items: farmerItems,
        totalItems: farmerItems.length,
        buyer: order.userId.email
      };
    }).filter(order => order.items.length > 0);
    
    console.log(`Found ${farmerOrders.length} farmer orders`);
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

module.exports = router;


