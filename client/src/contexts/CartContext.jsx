import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch cart data
  const fetchCart = async () => {
    if (!user || user.role !== 'buyer') {
      setCartItems([])
      setCartCount(0)
      setSubtotal(0)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.getCart()
      const cart = response.cart || { items: [], subtotal: 0 }
      setCartItems(cart.items || [])
      setCartCount((cart.items || []).reduce((total, item) => total + item.quantity, 0))
      setSubtotal(cart.subtotal || 0)
    } catch (error) {
      console.error('Cart fetch error:', error)
      setCartItems([])
      setCartCount(0)
      setSubtotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.addToCart({ productId, quantity })
      await fetchCart() // Refresh cart data
      return true
    } catch (error) {
      console.error('Add to cart error:', error)
      return false
    }
  }

  // Update item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      console.log('Updating item with ID:', itemId, 'to quantity:', quantity)
      console.log('Current cart items:', cartItems.map(item => ({ id: item._id, productId: item.productId })))
      
      await api.updateCartItem(itemId, { quantity })
      await fetchCart() // Refresh cart data
      return true
    } catch (error) {
      console.error('Update cart error:', error)
      return false
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      console.log('Removing item with ID:', itemId)
      console.log('Current cart items:', cartItems.map(item => ({ id: item._id, productId: item.productId })))
      
      await api.removeFromCart(itemId)
      await fetchCart() // Refresh cart data
      return true
    } catch (error) {
      console.error('Remove from cart error:', error)
      return false
    }
  }

  // Clear entire cart
  const clearCart = () => {
    setCartItems([])
    setCartCount(0)
    setSubtotal(0)
  }

  // Fetch cart when user changes
  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCart()
    } else {
      clearCart()
    }
  }, [user])

  const value = {
    cartItems,
    cartCount,
    subtotal,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext