import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

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
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {buyerName}!
        </h1>
        <p className="text-muted-foreground mt-2">Discover fresh products from local farmers</p>
      </div>

      {/* Featured Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Featured Products</CardTitle>
            <Link to="/buyer/products" className="text-primary text-sm font-medium hover:underline">
              Browse All Products
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-5xl opacity-50">📦</span>
              <p className="mt-4">No featured products available</p>
              <Link to="/buyer/products" className="text-primary hover:underline mt-2 inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'} 
                      alt={product.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description || 'Fresh produce from local farmers'}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-xl font-bold text-primary">₹{product.price}</span>
                          <span className="text-sm text-muted-foreground">/{product.unit || 'kg'}</span>
                        </div>
                        <Link to="/buyer/products" className="text-xs text-primary hover:underline">
                          View Details
                        </Link>
                      </div>
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        by {product.sellerId?.email}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
