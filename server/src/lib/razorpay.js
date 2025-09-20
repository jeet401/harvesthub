let instance = null;

function getRazorpay() {
  if (instance) return instance;
  const Razorpay = require('razorpay');
  const key_id = process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

module.exports = { getRazorpay };


