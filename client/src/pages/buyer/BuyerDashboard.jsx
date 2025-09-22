import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function BuyerDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, cartItems: 0, totalOrders: 0, favoriteProducts: 0 })
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with real API calls
      setStats({ totalProducts: 24, cartItems: 3, totalOrders: 5, favoriteProducts: 8 })
      setFeaturedProducts([
        { id: 1, name: 'Fresh Tomatoes', price: 80, unit: 'kg', image_url: '/fresh-vegetables-tomatoes-carrots-onions.png', farmer: { full_name: 'John Doe', city: 'Mumbai' } },
        { id: 2, name: 'Organic Apples', price: 120, unit: 'kg', image_url: '/fresh-colorful-fruits-apples-oranges-bananas.png', farmer: { full_name: 'Jane Smith', city: 'Delhi' } },
        { id: 3, name: 'Wheat Seeds', price: 45, unit: 'kg', image_url: '/various-seeds-packets-wheat-rice-vegetable-seeds.png', farmer: { full_name: 'Mike Johnson', city: 'Pune' } },
      ])
      setCategories([
        { id: 1, name: 'Fruits', type: 'fruits' },
        { id: 2, name: 'Vegetables', type: 'vegetables' },
        { id: 3, name: 'Seeds', type: 'seeds' },
        { id: 4, name: 'Fertilizers', type: 'fertilizers' },
      ])
      setProfile({ full_name: 'Buyer User' })
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (type) => {
    const icons = { fruits: '🍎', vegetables: '🥕', seeds: '🌱', fertilizers: '🍃' }
    return icons[type] || '📦'
  }

  const getCategoryColor = (type) => {
    const colors = {
      fruits: 'bg-red-100 text-red-600',
      vegetables: 'bg-orange-100 text-orange-600',
      seeds: 'bg-green-100 text-green-600',
      fertilizers: 'bg-emerald-100 text-emerald-600',
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { title: 'Available Products', value: stats.totalProducts, icon: '📦', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Items in Cart', value: stats.cartItems, icon: '🛒', color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Total Orders', value: stats.totalOrders, icon: '📈', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Favorite Products', value: stats.favoriteProducts, icon: '❤️', color: 'text-red-600', bgColor: 'bg-red-100' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name || 'Buyer'}!
        </h1>
        <p className="text-muted-foreground mt-2">Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <span className="text-base">{stat.icon}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shop by Category</CardTitle>
            <Link to="/buyer/products" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/buyer/products?category=${category.id}`}
                className="flex flex-col items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors no-underline text-foreground"
              >
                <div className={`p-3 rounded-lg mb-2 ${getCategoryColor(category.type)}`}>
                  <span className="text-2xl">{getCategoryIcon(category.type)}</span>
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Featured Products</CardTitle>
            <Link to="/buyer/products" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-5xl opacity-50">📦</span>
              <p className="mt-4">No featured products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description || 'Fresh produce from local farmers'}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-primary">₹{product.price}</span>
                          <span className="text-sm text-muted-foreground">/{product.unit}</span>
                        </div>
                        <Button size="sm">Add to Cart</Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {product.farmer?.full_name} • {product.farmer?.city}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Link to="/buyer/products" className="block">
              <Button variant="default" className="w-full h-16 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📦</span>
                <span className="text-sm font-medium">Browse Products</span>
              </Button>
            </Link>
            <Link to="/buyer/cart" className="block">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">🛒</span>
                <span className="text-sm font-medium">View Cart</span>
              </Button>
            </Link>
            <Link to="/buyer/orders" className="block">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📈</span>
                <span className="text-sm font-medium">My Orders</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
