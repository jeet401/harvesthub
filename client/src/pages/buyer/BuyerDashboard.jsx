import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [buyerName, setBuyerName] = useState('')

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
      const productsResponse = await api.getProducts({ limit: 6 })
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
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
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

  if (isLoading) {
    return (
      <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="p-6">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-6 animate-pulse" />
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
    <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="p-6 space-y-6">
        {/* Welcome Message */}
        <div className="float-animation">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
            Welcome back, {buyerName}! 🛒✨
          </h1>
          <p className="text-gray-600 mt-2">Discover fresh products from local farmers with magical ease</p>
        </div>

        {/* Live Chat Section */}
        <MagicCard glowIntensity="magical" className="bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-100">💬 Live Chat with Farmers</h2>
                <p className="text-green-100">Connect directly with farmers for price negotiations and custom orders</p>
              </div>
              <Link 
                to="/chat" 
                className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Chatting ✨
              </Link>
            </div>
          </div>
        </MagicCard>

        {/* Featured Products */}
        <MagicCard glowIntensity="intense">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">🌟 Featured Products</h2>
              <Link to="/buyer/products" className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors">
                Browse All Products →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {featuredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <span className="text-6xl opacity-50">📦</span>
                <p className="mt-4 text-lg">No featured products available</p>
                <Link to="/buyer/products" className="text-green-600 hover:text-green-700 mt-2 inline-block font-medium">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {featuredProducts.slice(0, 6).map((product) => (
                  <MagicCard key={product._id} className="overflow-hidden" glowIntensity="medium">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                      />
                    </div>
                    <div className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{product.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description || 'Fresh produce from local farmers'}
                        </p>
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                              <span className="text-sm text-gray-500">/{product.unit || 'kg'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link 
                              to="/buyer/products" 
                              className="flex-1 px-3 py-2 bg-green-500 text-white text-center text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Add to Cart
                            </Link>
                            <button
                              onClick={() => handleChatWithFarmer(product)}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              💬 Chat
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 border-t pt-2">
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
