import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Button } from '../../components/ui/button'
import { useCart } from '../../contexts/CartContext.jsx'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

export default function Cart() {
  const { 
    cartItems, 
    subtotal, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    fetchCart 
  } = useCart()

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
      return
    }
    
    await updateCartItem(itemId, newQuantity)
  }

  const removeItem = async (itemId) => {
    await removeFromCart(itemId)
  }

  const proceedToCheckout = () => {
    // Navigate to checkout
    window.location.href = '/buyer/checkout'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">Shopping Cart ✨</h1>
          <p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <MagicCard className="text-center py-12" glowIntensity="medium">
            <span className="text-5xl opacity-50">🛒</span>
            <p className="mt-4 text-lg text-gray-600">Your cart is empty</p>
            <p className="mt-2 text-gray-500">Add some products to get started</p>
            <Link to="/buyer/products" className="inline-block mt-4">
              <Button className="glow-pulse bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-400/25">Browse Products</Button>
            </Link>
          </MagicCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <MagicCard key={item._id} className="p-4" glowIntensity="medium">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.productId?.images?.[0] || '/placeholder.svg'} alt={item.productId?.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.productId?.title}</h3>
                          <p className="text-sm text-gray-600">₹{item.priceAtAdd}/kg</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 p-0 border-green-200 text-green-700 hover:bg-green-50 glow-pulse"
                            >
                              -
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 p-0 border-green-200 text-green-700 hover:bg-green-50 glow-pulse"
                            >
                              +
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                              ₹{item.priceAtAdd * item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 glow-pulse"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
              ))}
            </div>
          </div>

            {/* Order Summary */}
            <div>
              <MagicCard className="sticky top-6 p-6" glowIntensity="high">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹50</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">₹{subtotal + 50}</span>
                  </div>

                  <Button
                    onClick={proceedToCheckout}
                    className="w-full glow-pulse bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-400/25"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>

                  <Link to="/buyer/products" className="block text-center text-green-600 hover:text-green-700 hover:underline text-sm transition-colors duration-200">
                    Continue Shopping
                  </Link>
                </div>
              </MagicCard>
            </div>
          </div>
        )}
      </div>
    </MagicBento>
  )
}
