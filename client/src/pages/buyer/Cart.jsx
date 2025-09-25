import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useCart } from '../../contexts/CartContext.jsx'

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Shopping Cart</h1>
        <p className="text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <span className="text-5xl opacity-50">🛒</span>
          <p className="mt-4 text-lg">Your cart is empty</p>
          <p className="mt-2">Add some products to get started</p>
          <Link to="/buyer/products" className="inline-block mt-4">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.productId?.images?.[0] || '/placeholder.svg'} alt={item.productId?.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{item.productId?.title}</h3>
                          <p className="text-sm text-muted-foreground">₹{item.priceAtAdd}/kg</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              -
                            </Button>
                            <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-primary">
                              ₹{item.priceAtAdd * item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">₹50</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold text-primary">₹{subtotal + 50}</span>
                </div>

                <Button
                  onClick={proceedToCheckout}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Link to="/buyer/products" className="block text-center text-primary hover:underline text-sm">
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
