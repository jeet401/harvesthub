const router = require('express').Router();
const Order = require('../models/Order');
const { authRequired } = require('../middleware/auth');

// Get orders for buyers
router.get('/', authRequired, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'title images price')
      .populate('items.sellerId', 'email')
      .sort({ createdAt: -1 });
    
    return res.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get orders for farmers (their products that were ordered)
router.get('/farmer', authRequired, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.sellerId': req.user.id })
      .populate('userId', 'email')
      .populate('items.productId', 'title images price')
      .sort({ createdAt: -1 });
    
    // Filter items that belong to this farmer
    const farmerOrders = orders.map(order => {
      const farmerItems = order.items.filter(item => 
        item.sellerId.toString() === req.user.id
      );
      
      return {
        ...order.toObject(),
        items: farmerItems,
        totalItems: farmerItems.length,
        buyer: order.userId.email
      };
    }).filter(order => order.items.length > 0);
    
    return res.json({ orders: farmerOrders });
  } catch (error) {
    console.error('Farmer orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch farmer orders' });
  }
});

// Update order status (farmers only)
router.put('/:id/status', authRequired, async (req, res) => {
  try {
    const { status, progress, trackingId } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if farmer owns any items in this order
    const hasItems = order.items.some(item => 
      item.sellerId.toString() === req.user.id
    );
    
    if (!hasItems) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    if (status) order.status = status;
    if (progress !== undefined) order.progress = progress;
    if (trackingId) order.trackingId = trackingId;
    
    await order.save();
    
    return res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Order status update error:', error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;


