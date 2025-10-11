import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { Button } from '../../components/ui/button'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'
import { Truck, CreditCard, MapPin, ShoppingBag, Loader2 } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/auth/login?type=buyer')
      return
    }
    fetchCartItems()
  }, [user, navigate])

  const fetchCartItems = async () => {
    try {
      // Get cart items from context or API
      let items = []
      if (contextCartItems && contextCartItems.length > 0) {
        items = contextCartItems
      } else {
        // Fallback to API call
        const response = await api.getCart()
        items = response.items || []
      }
      
      if (items.length === 0) {
        navigate('/buyer/cart')
        return
      }
      
      setCartItems(items)
      calculateTotals(items)
    } catch (error) {
      console.error('Cart fetch error:', error)
      setErrors({ general: 'Failed to load cart items' })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = (items) => {
    const subtotalAmount = items.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0
      const quantity = item.quantity || 0
      return sum + (price * quantity)
    }, 0)
    
    const shippingAmount = subtotalAmount > 500 ? 0 : 50 // Free shipping above ₹500
    const taxAmount = Math.round(subtotalAmount * 0.05) // 5% tax
    const totalAmount = subtotalAmount + shippingAmount + taxAmount
    
    setSubtotal(subtotalAmount)
    setShippingCharges(shippingAmount)
    setTaxes(taxAmount)
    setTotal(totalAmount)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!deliveryAddress.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!deliveryAddress.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(deliveryAddress.phone)) newErrors.phone = 'Enter valid 10-digit phone number'
    if (!deliveryAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!deliveryAddress.city.trim()) newErrors.city = 'City is required'
    if (!deliveryAddress.state.trim()) newErrors.state = 'State is required'
    if (!deliveryAddress.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(deliveryAddress.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      setErrors({ ...errors, general: 'Please fill all required fields correctly' })
      return
    }
    
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
          name: 'FarmByte',
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
            general: `Payment failed: ${response.error.description}. Please try again.` 
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
      setErrors({ 
        general: error.message || 'Failed to initiate payment. Please try again.' 
      })
      setIsProcessing(false)
    }
  }

  if (isLoading) {
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
          
          {errors.general && (
            <div className={`mt-4 p-4 rounded-lg border ${isDarkMode 
              ? 'bg-red-900/20 border-red-500/50 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {errors.general}
            </div>
          )}
        </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
        {/* Order Details */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 60, height: 60, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.product.image_url || '/placeholder.svg'} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{item.product.name}</h3>
                    <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px 0' }}>Qty: {item.quantity} × ₹{item.product.price}</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#16a34a', margin: 0 }}>₹{item.product.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Delivery Information</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#16a34a' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '2px solid #86efac', 
                    backgroundColor: '#f0fdf4',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    ':focus': { borderColor: '#16a34a', backgroundColor: '#fff' }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a34a'
                    e.target.style.backgroundColor = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#86efac'
                    e.target.style.backgroundColor = '#f0fdf4'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#16a34a' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter your phone number"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '2px solid #86efac', 
                    backgroundColor: '#f0fdf4',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a34a'
                    e.target.style.backgroundColor = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#86efac'
                    e.target.style.backgroundColor = '#f0fdf4'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#16a34a' }}>Delivery Address</label>
                <textarea 
                  rows={4} 
                  placeholder="Enter your complete delivery address"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '2px solid #86efac', 
                    backgroundColor: '#f0fdf4',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a34a'
                    e.target.style.backgroundColor = '#fff'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#86efac'
                    e.target.style.backgroundColor = '#f0fdf4'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, position: 'sticky', top: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Payment Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Shipping</span>
              <span style={{ fontWeight: 500 }}>₹{shipping}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#16a34a' }}>₹{total}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || cartItems.length === 0}
              style={{
                width: '100%',
                background: isProcessing ? '#9ca3af' : '#16a34a',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                border: 0,
                fontSize: 16,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${total}`}
            </button>

            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              Secure payment powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
