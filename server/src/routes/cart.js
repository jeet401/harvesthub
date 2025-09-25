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
    
    console.log('Updating item with ID:', req.params.itemId, 'to quantity:', quantity);
    
    // Find the specific item
    const item = cart.items.find(item => item._id.toString() === req.params.itemId);
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
    
    console.log('Removing item with ID:', req.params.itemId);
    console.log('Cart items before removal:', cart.items.map(item => ({ id: item._id, productId: item.productId })));
    
    // Find and remove the specific item
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
    await cart.save();
    
    console.log('Cart items after removal:', cart.items.map(item => ({ id: item._id, productId: item.productId })));
    
    return res.json({ cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

module.exports = router;


