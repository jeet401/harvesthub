import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { api } from '../../lib/api'
import MagicBento from '../../components/MagicBento'
import MagicCard from '../../components/MagicCard'
import { CheckCircle, Package, Truck, CreditCard, Calendar, MapPin, DollarSign } from 'lucide-react'

export default function OrderSuccess() {
  const { isDarkMode } = useTheme()
  const [searchParams] = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const orderId = searchParams.get('orderId')
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setIsLoading(false)
    }
  }, [orderId])
  
  const fetchOrderDetails = async () => {
    try {
      const response = await api.getOrder(orderId)
      console.log('Order details response:', response)
      // The API returns { order }, so we need to extract the order
      setOrderDetails(response.order || response)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="p-6 max-w-4xl mx-auto pt-20">
          <MagicCard className="p-12 animate-pulse">
            <div className={`h-8 rounded-lg w-3/4 mx-auto mb-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
            <div className={`h-4 rounded w-1/2 mx-auto ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
          </MagicCard>
        </div>
      </MagicBento>
    )
  }
  
  return (
    <MagicBento className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      <div className="p-6 max-w-4xl mx-auto pt-12">
        {/* Success Header */}
        <MagicCard className="p-8 text-center mb-8" glowIntensity="high">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isDarkMode 
              ? 'bg-emerald-900/30' 
              : 'bg-emerald-100'
            }`}>
              <CheckCircle className={`h-12 w-12 ${isDarkMode 
                ? 'text-emerald-400' 
                : 'text-emerald-600'
              }`} />
            </div>
          </div>
          
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent`}>
            Payment Successful! ✨
          </h1>
          
          <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Your order has been confirmed and payment processed successfully.
          </p>
          
          {orderDetails && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode 
              ? 'bg-gray-800 text-emerald-400' 
              : 'bg-emerald-50 text-emerald-700'
            } font-medium`}>
              <Package className="h-4 w-4" />
              Order ID: #{orderDetails._id?.slice(-8).toUpperCase() || 'N/A'}
            </div>
          )}
        </MagicCard>

        {/* Order Details */}
        {orderDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Payment Information */}
            <MagicCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Payment Details
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`h-4 w-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount Paid</span>
                  </div>
                  <span className={`font-bold text-xl ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ₹{orderDetails.totalAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</span>
                  </div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Razorpay
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transaction ID</span>
                  </div>
                  <span className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {orderDetails.razorpayPaymentId?.slice(-12) || 'Processing...'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${isDarkMode 
                    ? 'bg-emerald-900/30 text-emerald-400' 
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    ✓ Confirmed
                  </span>
                </div>
              </div>
            </MagicCard>

            {/* Delivery Information */}
            <MagicCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delivery Details
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Delivery</span>
                  </div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {orderDetails.estimatedDelivery 
                      ? new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '7-10 business days'
                    }
                  </span>
                </div>
                
                {orderDetails.deliveryAddress && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MapPin className={`h-4 w-4 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div className="min-w-0">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>
                          Delivery Address
                        </span>
                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <p className="font-medium">{orderDetails.deliveryAddress.fullName}</p>
                          <p className="text-xs leading-relaxed">
                            {orderDetails.deliveryAddress.addressLine1}
                            {orderDetails.deliveryAddress.addressLine2 && `, ${orderDetails.deliveryAddress.addressLine2}`}
                            <br />
                            {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                          </p>
                          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            📞 {orderDetails.deliveryAddress.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </MagicCard>
          </div>
        )}

        {/* Order Summary */}
        {orderDetails?.items && (
          <MagicCard className="p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Summary ({orderDetails.items.length} items)
              </h2>
            </div>
            
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className={`flex gap-4 p-4 rounded-lg border ${isDarkMode 
                  ? 'border-gray-700 bg-gray-800/50' 
                  : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-100 to-green-100">
                    <img 
                      src={item.productId?.image_url || '/placeholder.svg'} 
                      alt={item.productId?.title || 'Product'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.productId?.title || 'Product'}
                    </h3>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                    <p className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ₹{item.totalPrice?.toLocaleString() || (item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>
        )}

        {/* Action Buttons */}
        <MagicCard className="p-6 text-center">
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We'll send you order updates via email and SMS. Thank you for choosing FarmByte! �
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/buyer/orders" 
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Package className="h-5 w-5" />
              Track Order
            </Link>
            <Link 
              to="/buyer/products" 
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 border-2 flex items-center gap-2 ${isDarkMode 
                ? 'border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Truck className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </MagicCard>
      </div>
    </MagicBento>
  )
}
