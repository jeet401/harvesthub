import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { TrendingUp, Package, ShoppingCart } from 'lucide-react'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const { addToCart: addToCartContext } = useCart()
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [buyerName, setBuyerName] = useState('')
  const [cartLoading, setCartLoading] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch buyer's profile to get name
      const profileResponse = await api.getProfile()
      console.log('Profile Response:', profileResponse) // Debug log
      
      // Extract name from profile response
      const profileName = profileResponse.profile?.name || 
                         profileResponse.user?.name || 
                         profileResponse.name || 
                         user?.email?.split('@')[0] || 
                         'Buyer'
      
      setBuyerName(profileName)
      
      // Fetch featured products from real API
      console.log('Fetching featured products...')
      const productsResponse = await api.getProducts({ limit: 6 })
      console.log('Featured products response:', productsResponse)
      console.log('Featured products count:', productsResponse.products?.length || 0)
      setFeaturedProducts(productsResponse.products || [])
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      // Fallback to user email or default
      const fallbackName = user?.email?.split('@')[0] || 'Buyer'
      setBuyerName(fallbackName)
      setFeaturedProducts([
        { _id: '1', title: 'Fresh Tomatoes', price: 80, images: ['/fresh-vegetables-tomatoes-carrots-onions.png'], sellerId: { email: 'john@example.com' } },
        { _id: '2', title: 'Organic Apples', price: 120, images: ['/fresh-colorful-fruits-apples-oranges-bananas.png'], sellerId: { email: 'jane@example.com' } },
        { _id: '3', title: 'Wheat Seeds', price: 45, images: ['/various-seeds-packets-wheat-rice-vegetable-seeds.png'], sellerId: { email: 'mike@example.com' } },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatWithFarmer = async (product) => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to chat with farmers.')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantId: product.sellerId._id || product.sellerId,
          productId: product._id,
          initialMessage: `Hi! I'm interested in your ${product.title}. Can we discuss the price?`
        })
      })

      if (response.ok) {
        navigate('/chat')
      } else {
        alert('Failed to start conversation. Please try again.')
      }
    } catch (error) {
      console.error('Chat initiation error:', error)
      alert('Failed to start conversation. Please try again.')
    }
  }

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    setCartLoading(productId)
    try {
      const success = await addToCartContext(productId, 1)
      if (success) {
        alert('Added to cart! 🛒')
      } else {
        alert('Failed to add to cart. Please try again.')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setCartLoading(null)
    }
  }

  if (isLoading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="p-6">
          <div className={`h-8 rounded-lg w-1/3 mb-6 animate-pulse ${isDarkMode 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
          }`} />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <MagicCard key={i} className="h-64 animate-pulse" />
            ))}
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
      <div className="p-6 space-y-6">
        {/* Welcome Message */}
        <div className="float-animation">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent`}>
            Welcome back, {buyerName}! 🛒✨
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Discover fresh products from local farmers with magical ease</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MagicCard 
            className={`p-4 cursor-pointer hover:scale-105 transition-transform ${isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-800' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
            }`}
            onClick={() => navigate('/buyer/analytics')}
            glowIntensity="medium"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full mr-4 ${isDarkMode 
                ? 'bg-blue-800/50' 
                : 'bg-blue-100'
              }`}>
                <TrendingUp className={`h-5 w-5 ${isDarkMode 
                  ? 'text-blue-400' 
                  : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your spending & orders</p>
              </div>
            </div>
          </MagicCard>

          <MagicCard 
            className={`p-4 cursor-pointer hover:scale-105 transition-transform ${isDarkMode 
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-800' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}
            onClick={() => navigate('/buyer/orders')}
            glowIntensity="medium"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full mr-4 ${isDarkMode 
                ? 'bg-green-800/50' 
                : 'bg-green-100'
              }`}>
                <Package className={`h-5 w-5 ${isDarkMode 
                  ? 'text-green-400' 
                  : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Orders</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>View order history</p>
              </div>
            </div>
          </MagicCard>

          <MagicCard 
            className={`p-4 cursor-pointer hover:scale-105 transition-transform ${isDarkMode 
              ? 'bg-gradient-to-br from-purple-900/50 to-violet-900/50 border-purple-800' 
              : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200'
            }`}
            onClick={() => navigate('/buyer/cart')}
            glowIntensity="medium"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full mr-4 ${isDarkMode 
                ? 'bg-purple-800/50' 
                : 'bg-purple-100'
              }`}>
                <ShoppingCart className={`h-5 w-5 ${isDarkMode 
                  ? 'text-purple-400' 
                  : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shopping Cart</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>View cart items</p>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Live Chat Section */}
        <MagicCard glowIntensity="magical" className={`${isDarkMode 
          ? 'bg-gradient-to-r from-green-700 to-emerald-700' 
          : 'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>💬 Live Chat with Farmers</h2>
                <p className={isDarkMode ? 'text-white/90' : 'text-gray-800'}>Connect directly with farmers for price negotiations and custom orders</p>
              </div>
              <Link 
                to="/chat" 
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isDarkMode 
                  ? 'bg-gray-800 text-green-400 hover:bg-gray-700' 
                  : 'bg-white text-green-600 hover:bg-green-50'
                }`}
              >
                Start Chatting ✨
              </Link>
            </div>
          </div>
        </MagicCard>

        {/* Featured Products */}
        <MagicCard glowIntensity="intense">
          <div className={`p-6 rounded-t-xl ${isDarkMode 
            ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30' 
            : 'bg-gradient-to-r from-blue-50 to-cyan-50'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🌟 Featured Products</h2>
              <Link to="/buyer/products" className={`text-sm font-medium transition-colors ${isDarkMode 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-green-600 hover:text-green-700'
              }`}>
                Browse All Products →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {featuredProducts.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="text-6xl opacity-50">📦</span>
                <p className="mt-4 text-lg">No featured products available</p>
                <Link to="/buyer/products" className={`mt-2 inline-block font-medium ${isDarkMode 
                  ? 'text-green-400 hover:text-green-300' 
                  : 'text-green-600 hover:text-green-700'
                }`}>
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 6).map((product) => (
                  <MagicCard key={product._id} className="overflow-hidden" glowIntensity="medium">
                    <div className={`aspect-[4/3] overflow-hidden ${isDarkMode 
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                      />
                    </div>
                    <div className="p-3">
                      <div className="space-y-1.5">
                        <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.title}</h3>
                        <p className={`text-xs line-clamp-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {product.description || 'Fresh produce from local farmers'}
                        </p>
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>₹{product.price}</span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{product.unit || 'kg'}</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleAddToCart(product._id)}
                              disabled={cartLoading === product._id || !user}
                              className="flex-1 px-2 py-1.5 bg-green-500 text-white text-center text-xs font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                              onClick={() => handleChatWithFarmer(product)}
                              className="flex-1 px-2 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                            >
                              💬 Chat
                            </button>
                          </div>
                        </div>
                        <div className={`text-xs pt-1.5 border-t ${isDarkMode 
                          ? 'text-gray-400 border-gray-700' 
                          : 'text-gray-500 border-gray-200'
                        }`}>
                          by {product.sellerId?.email}
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                ))}
              </div>
            )}
          </div>
        </MagicCard>
      </div>
    </MagicBento>
  )
}
