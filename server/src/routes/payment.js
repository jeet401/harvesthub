const router = require('express').Router();
const crypto = require('crypto');
const { getRazorpay } = require('../lib/razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authRequired } = require('../middleware/auth');

// Create Razorpay order
router.post('/create-order', authRequired, async (req, res) => {
  try {
    const { cartItems, deliveryAddress, notes } = req.body || {};
    
    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }
    
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || 
        !deliveryAddress.addressLine1 || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.pincode) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }

    // Fetch and validate products
    const productIds = cartItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate('sellerId');
    
    if (products.length !== cartItems.length) {
      return res.status(400).json({ message: 'Some products are not available' });
    }

    // Calculate totals and create order items
    let subtotal = 0;
    const orderItems = [];
    
    for (const cartItem of cartItems) {
      const product = products.find(p => p._id.toString() === cartItem.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${cartItem.productId} not found` });
      }
      
      if (product.quantity < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${cartItem.quantity}` 
        });
      }
      
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId._id,
        quantity: cartItem.quantity,
        price: product.price,
        totalPrice: itemTotal
      });
    }
    
    // Calculate shipping and total amount
    const shippingCharges = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const totalAmount = subtotal + shippingCharges + taxes;
    
    // Create order in database
    const order = await Order.create({
      userId: req.user.sub,
      items: orderItems,
      subtotal,
      shippingCharges,
      taxes,
      totalAmount,
      deliveryAddress,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // Create Razorpay order
    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: order._id.toString(),
      notes: {
        userId: req.user.sub,
        orderId: order._id.toString()
      }
    });
    
    // Update order with Razorpay order ID
    await Order.findByIdAndUpdate(order._id, { razorpayOrderId: rzpOrder.id });
    
    return res.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      dbOrderId: order._id,
      orderDetails: {
        subtotal,
        shippingCharges,
        taxes,
        totalAmount,
        itemCount: orderItems.length
      }
    });
    
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// Verify payment and complete order
router.post('/verify', authRequired, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }
    
    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');
      
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Find and update order
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: req.user.sub },
      { 
        status: 'confirmed',
        paymentStatus: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        progress: 25, // Payment completed, order confirmed
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      { new: true }
    ).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update product quantities (reduce stock)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { quantity: -item.quantity } }
      );
    }
    
    // Clear user's cart after successful payment
    await Cart.findOneAndUpdate(
      { userId: req.user.sub },
      { $set: { items: [] } }
    );
    
    return res.json({ 
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
      trackingId: order.trackingId,
      estimatedDelivery: order.estimatedDelivery
    });
    
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
});

// Get payment status
router.get('/status/:orderId', authRequired, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.sub 
    }).populate('items.productId items.sellerId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    return res.json({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      estimatedDelivery: order.estimatedDelivery,
      progress: order.progress
    });
    
  } catch (err) {
    console.error('Get payment status error:', err);
    return res.status(500).json({ message: 'Failed to get payment status' });
  }
});

module.exports = router;


