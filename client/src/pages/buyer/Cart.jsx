import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await api.getCart()
      const cart = response.cart || { items: [], subtotal: 0 }
      setCartItems(cart.items || [])
      setSubtotal(cart.subtotal || 0)
    } catch (error) {
      console.error('Cart fetch error:', error)
      // Fallback to empty cart if API fails
      setCartItems([])
      setSubtotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }
    
    try {
      await api.updateCartItem(itemId, { quantity: newQuantity })
      // Refresh cart data
      fetchCartItems()
    } catch (error) {
      console.error('Update quantity error:', error)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId)
      // Refresh cart data
      fetchCartItems()
    } catch (error) {
      console.error('Remove item error:', error)
    }
  }

  const proceedToCheckout = () => {
    // Navigate to checkout
    window.location.href = '/buyer/checkout'
  }

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ height: 32, background: '#e5e7eb', borderRadius: 8, width: '33%', marginBottom: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 120, background: '#e5e7eb', borderRadius: 8 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>Shopping Cart</h1>
        <p style={{ color: '#6b7280' }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <span style={{ fontSize: 48, opacity: 0.5 }}>🛒</span>
          <p style={{ marginTop: 16, fontSize: 18 }}>Your cart is empty</p>
          <p style={{ marginTop: 8 }}>Add some products to get started</p>
          <Link to="/buyer/products" style={{ display: 'inline-block', marginTop: 16, background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
          {/* Cart Items */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map((item) => (
                <div key={item._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', gap: 16 }}>
                  <div style={{ width: 100, height: 100, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.productId?.images?.[0] || '/placeholder.svg'} alt={item.productId?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{item.productId?.title}</h3>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>₹{item.priceAtAdd}/kg</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 600, color: '#16a34a' }}>
                          ₹{item.priceAtAdd * item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(item._id)}
                          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, position: 'sticky', top: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Shipping</span>
                <span style={{ fontWeight: 500 }}>₹50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#16a34a' }}>₹{subtotal + 50}</span>
              </div>

              <button
                onClick={proceedToCheckout}
                style={{ width: '100%', background: '#16a34a', color: '#fff', padding: '12px 16px', borderRadius: 8, border: 0, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
              >
                Proceed to Checkout
              </button>

              <Link to="/buyer/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#16a34a', textDecoration: 'none', fontSize: 14 }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
