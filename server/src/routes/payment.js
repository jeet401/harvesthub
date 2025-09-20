const router = require('express').Router();
const crypto = require('crypto');
const { getRazorpay } = require('../lib/razorpay');
const Order = require('../models/Order');
const { authRequired } = require('../middleware/auth');

router.post('/create-order', authRequired, async (req, res) => {
  try {
    const { amount } = req.body || {};
    if (!amount) return res.status(400).json({ message: 'Amount required' });
    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({ amount, currency: 'INR' });
    const order = await Order.create({ userId: req.user.sub, items: [], subtotal: amount / 100, status: 'pending', razorpayOrderId: rzpOrder.id });
    return res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, receipt: rzpOrder.receipt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

router.post('/verify', authRequired, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ message: 'Missing payment details' });
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: req.user.sub },
      { status: 'paid', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
});

module.exports = router;


