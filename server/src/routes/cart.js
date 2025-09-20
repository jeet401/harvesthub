const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authRequired } = require('../middleware/auth');

router.get('/', authRequired, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.sub }).populate('items.productId');
    return res.json({ cart: cart || { items: [], subtotal: 0 } });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

router.post('/add', authRequired, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ userId: req.user.sub });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.sub, items: [], subtotal: 0 });
    }
    
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        priceAtAdd: product.price
      });
    }
    
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    await cart.save();
    
    return res.json({ cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ message: 'Failed to add to cart' });
  }
});

router.put('/:itemId', authRequired, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.sub });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.quantity = quantity;
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    await cart.save();
    
    return res.json({ cart });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
});

router.delete('/:itemId', authRequired, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.sub });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items.pull(req.params.itemId);
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    await cart.save();
    
    return res.json({ cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

module.exports = router;


