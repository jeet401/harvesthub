import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

export default function BuyerDashboard() {
  const { user } = useAuth()
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
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                            <span className="text-sm text-gray-500">/{product.unit || 'kg'}</span>
                          </div>
                          <Link to="/buyer/products" className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
                            View Details
                          </Link>
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
