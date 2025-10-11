import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { Button } from '../../components/ui/button'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'
import { Truck, CreditCard, MapPin, ShoppingBag, Loader2, AlertCircle } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { isDarkMode } = useTheme()
  const { cartItems: contextCartItems, clearCart } = useCart()
  
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [shippingCharges, setShippingCharges] = useState(0)
  const [taxes, setTaxes] = useState(0)
  const [total, setTotal] = useState(0)
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  })
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  // Utility to properly format error messages
  const formatError = (error) => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.error) return error.error
    if (typeof error === 'object') return JSON.stringify(error)
    return 'An unexpected error occurred'
  }

  useEffect(() => {
    // Clear any existing errors on mount
    setErrors({})
    
    // Don't redirect during auth loading state
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }
    
    console.log('=== Checkout Authentication Debug ===')
    console.log('authLoading:', authLoading)
    console.log('user:', user)
    console.log('user type:', typeof user)
    console.log('user.role:', user?.role)
    console.log('user.email:', user?.email)
    console.log('user.authenticated:', user?.authenticated)
    console.log('=====================================')
    
    // For now, let's be very permissive to debug the issue
    // We'll check if there's any user object at all
    if (!user) {
      console.log('❌ No user object found, redirecting to login')
      navigate('/auth/login?type=buyer')
      return
    }
    
    // If user exists but role is not buyer, warn but continue (for debugging)
    if (user.role && user.role !== 'buyer') {
      console.warn('⚠️ User role is not buyer:', user.role, 'but continuing for debug')
    }
    
    console.log('✅ User exists, proceeding to fetch cart')
    fetchCartItems()
  }, [user, navigate, authLoading])

  // Also fetch when context cart items change
  useEffect(() => {
    if (contextCartItems && contextCartItems.length > 0) {
      console.log('Context cart items updated, refreshing checkout...')
      fetchCartItems()
    }
  }, [contextCartItems])

  const fetchCartItems = async () => {
    try {
      console.log('=== Fetching Cart Items ===')
      console.log('contextCartItems:', contextCartItems)
      
      // Get cart items from context or API
      let items = []
      if (contextCartItems && contextCartItems.length > 0) {
        console.log('Using context cart items:', contextCartItems)
        console.log('First cart item structure:', contextCartItems[0])
        items = contextCartItems
      } else {
        console.log('Fetching cart from API...')
        // Fallback to API call
        try {
          const response = await api.getCart()
          console.log('API cart response:', response)
          items = response.cart?.items || response.items || []
        } catch (apiError) {
          console.error('API cart fetch failed:', apiError)
          
          // If still getting auth errors after automatic retry, redirect to login
          if (apiError.message && apiError.message.includes('Authentication required')) {
            setErrors({ general: 'Authentication failed. Please log in again.' })
            setTimeout(() => navigate('/auth/login?type=buyer'), 2000)
            return
          } else {
            items = []
          }
        }
      }
      
      console.log('Final cart items before normalization:', items)
      
      // Normalize cart items to ensure consistent structure
      const normalizedItems = items.map((item, index) => {
        console.log(`🔧 Normalizing item ${index}:`, item)
        
        // The cart API returns items with populated productId field
        // item.productId will be the full product object when populated
        // item.priceAtAdd is the price at the time of adding to cart
        const productData = item.productId || item.product
        const priceToUse = item.priceAtAdd || item.price || productData?.price || 0
        
        const normalized = {
          _id: item._id || item.id || `item-${index}`,
          quantity: Number(item.quantity || 1),
          priceAtAdd: Number(priceToUse),
          product: {
            _id: productData?._id || productData?.id || `product-${index}`,
            title: productData?.title || productData?.name || 'Unknown Product',
            name: productData?.name || productData?.title || 'Unknown Product',
            price: Number(productData?.price || priceToUse),
            imageUrl: productData?.imageUrl || productData?.image_url || productData?.images?.[0] || '/placeholder.jpg',
            image_url: productData?.image_url || productData?.imageUrl || productData?.images?.[0] || '/placeholder.jpg'
          }
        }
        
        console.log(`✅ Normalized item ${index}:`, normalized)
        return normalized
      })
      
      console.log('Final normalized cart items:', normalizedItems)
      
      // Only redirect if we truly have no items
      if (!normalizedItems || normalizedItems.length === 0) {
        console.log('❌ No cart items found, redirecting to cart page')
        setErrors({ general: 'Your cart is empty. Please add items to cart first.' })
        setTimeout(() => navigate('/buyer/cart'), 2000)
        return
      }
      
      // Clear any authentication errors if we have items (might be from context)
      if (normalizedItems.length > 0) {
        setErrors({})
      }
      
      setCartItems(normalizedItems)
      calculateTotals(normalizedItems)
    } catch (error) {
      console.error('Cart fetch error:', error)
      setErrors({ general: formatError(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = (items) => {
    console.log('=== Calculating Totals ===')
    console.log('Items for calculation:', items)
    
    const subtotalAmount = items.reduce((sum, item) => {
      // Use priceAtAdd from cart (negotiated/custom price) or fallback to product price
      const price = Number(item.priceAtAdd || item.product?.price || item.price || 0)
      const quantity = Number(item.quantity || 0)
      const itemTotal = price * quantity
      
      console.log(`Item: ${item.product?.title || item.product?.name || 'Unknown'}`)
      console.log(`  Price: ${price} (priceAtAdd: ${item.priceAtAdd}, product.price: ${item.product?.price})`)
      console.log(`  Quantity: ${quantity}`)
      console.log(`  Item Total: ${itemTotal}`)
      
      return sum + itemTotal
    }, 0)
    
    const shippingAmount = subtotalAmount > 500 ? 0 : 50 // Free shipping above ₹500
    const taxAmount = Math.round(subtotalAmount * 0.05) // 5% tax
    const totalAmount = subtotalAmount + shippingAmount + taxAmount
    
    console.log('Final Calculation Results:')
    console.log(`  Subtotal: ₹${subtotalAmount}`)
    console.log(`  Shipping: ₹${shippingAmount}`)
    console.log(`  Taxes (5%): ₹${taxAmount}`)
    console.log(`  Total: ₹${totalAmount}`)
    
    setSubtotal(subtotalAmount)
    setShippingCharges(shippingAmount)
    setTaxes(taxAmount)
    setTotal(totalAmount)
  }

  const validateForm = () => {
    const newErrors = {}
    
    console.log('=== Form Validation Debug ===')
    console.log('deliveryAddress:', deliveryAddress)
    
    if (!deliveryAddress.fullName?.trim()) newErrors.fullName = 'Full name is required'
    if (!deliveryAddress.phone?.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(deliveryAddress.phone)) newErrors.phone = 'Enter valid 10-digit phone number'
    if (!deliveryAddress.addressLine1?.trim()) newErrors.addressLine1 = 'Address is required'
    if (!deliveryAddress.city?.trim()) newErrors.city = 'City is required'
    if (!deliveryAddress.state?.trim()) newErrors.state = 'State is required'
    if (!deliveryAddress.pincode?.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(deliveryAddress.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode'
    
    console.log('Validation errors found:', newErrors)
    
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('Form validation result:', isValid)
    
    return isValid
  }

  const handlePayment = async () => {
    console.log('=== Payment Process Started ===')
    const isFormValid = validateForm()
    
    if (!isFormValid) {
      console.log('Form validation failed, not proceeding with payment')
      return
    }
    
    console.log('Form validation passed, proceeding with payment...')
    setIsProcessing(true)
    setErrors({})
    
    try {
      // Prepare cart items for order creation
      const orderCartItems = cartItems.map(item => ({
        productId: item.product?._id || item.productId,
        quantity: item.quantity
      }))
      
      // Create Razorpay order
      const orderResponse = await api.createOrder({ 
        cartItems: orderCartItems,
        deliveryAddress,
        notes: notes.trim()
      })
      
      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
          amount: orderResponse.amount,
          currency: orderResponse.currency,
          name: 'HarvestHub',
          description: `Order for ${orderResponse.orderDetails.itemCount} items`,
          order_id: orderResponse.orderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
              
              // Clear cart and navigate to success page
              clearCart()
              navigate(`/buyer/order-success?orderId=${verifyResponse.orderId}`)
            } catch (error) {
              console.error('Payment verification failed:', error)
              setErrors({ general: 'Payment verification failed. Please contact support if amount was debited.' })
            }
          },
          prefill: {
            name: deliveryAddress.fullName,
            email: user.email || '',
            contact: deliveryAddress.phone
          },
          theme: {
            color: isDarkMode ? '#10b981' : '#16a34a'
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false)
            }
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error)
          setErrors({ 
            general: `Payment failed: ${formatError(response.error)}. Please try again.` 
          })
          setIsProcessing(false)
        })
        
        rzp.open()
      }
      
      script.onerror = () => {
        setErrors({ general: 'Failed to load payment gateway. Please check your internet connection.' })
        setIsProcessing(false)
      }
      
      document.body.appendChild(script)
    } catch (error) {
      console.error('Payment initiation failed:', error)
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication required')) {
        setErrors({ 
          general: 'Session expired. Please log in again to continue with payment.' 
        })
        setTimeout(() => navigate('/auth/login?type=buyer'), 3000)
      } else {
        setErrors({ 
          general: formatError(error) || 'Failed to initiate payment. Please try again.' 
        })
      }
      setIsProcessing(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="p-6 max-w-6xl mx-auto">
          <div className={`h-8 rounded-lg w-1/3 mb-6 animate-pulse ${
            isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-gray-200 to-gray-300'
          }`} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MagicCard className="h-96 animate-pulse" />
            </div>
            <div>
              <MagicCard className="h-80 animate-pulse" />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {authLoading ? 'Checking authentication...' : 'Loading checkout...'}
            </p>
          </div>
        </div>
      </MagicBento>
    )
  }

  return (
    <MagicBento className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent`}>
            Checkout ✨
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Review your order and complete payment
          </p>
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className={`mt-2 p-2 rounded text-xs ${isDarkMode 
              ? 'bg-gray-800 text-gray-300' 
              : 'bg-gray-100 text-gray-600'
            }`}>
              Debug: User: {user?.email || 'No user'} | Role: {user?.role || 'No role'} | Auth Loading: {authLoading ? 'Yes' : 'No'}
            </div>
          )}
          
          {errors.general && (
            <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 ${isDarkMode 
              ? 'bg-red-900/20 border-red-500/50 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <span>{errors.general}</span>
                <button 
                  onClick={() => setErrors({})} 
                  className="ml-2 text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <MagicCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h2>
              </div>
              
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id || index} className={`flex gap-4 p-4 rounded-lg border ${isDarkMode 
                    ? 'border-gray-700 bg-gray-800/50' 
                    : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-100 to-green-100">
                      <img 
                        src={item.product?.image_url || item.product?.imageUrl || '/placeholder.svg'} 
                        alt={item.product?.title || item.product?.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.product?.title || item.product?.name}
                      </h3>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Qty: {item.quantity || 0} × ₹{Number(item.product?.price || item.price || 0).toLocaleString()}
                      </p>
                      <p className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{(Number(item.product?.price || item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MagicCard>

            {/* Delivery Information */}
            <MagicCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delivery Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.fullName}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, fullName: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.addressLine1}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine1: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.addressLine1 ? 'border-red-500' : ''}`}
                    placeholder="House/Flat no, Building name, Area"
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.addressLine2}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine2: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none`}
                    placeholder="Landmark (optional)"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    State *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.state ? 'border-red-500' : ''}`}
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                    className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none ${errors.pincode ? 'border-red-500' : ''}`}
                    placeholder="Enter 6-digit pincode"
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full p-3 rounded-lg border transition-colors resize-vertical ${isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                    } focus:outline-none`}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>
            </MagicCard>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <MagicCard className="p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment Summary
                </h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shipping</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Taxes (5%)</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{taxes.toLocaleString()}
                  </span>
                </div>
                <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total
                    </span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {subtotal > 500 && (
                <div className={`mb-4 p-3 rounded-lg ${isDarkMode 
                  ? 'bg-emerald-900/20 border border-emerald-500/30' 
                  : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Truck className={`h-4 w-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      FREE shipping on orders above ₹500!
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={isProcessing || cartItems.length === 0}
                className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total.toLocaleString()}`
                )}
              </Button>

              <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Secure payment powered by Razorpay
                </div>
                <p className="mt-1">Supports UPI, Cards, Net Banking & Wallets</p>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </MagicBento>
  )
}