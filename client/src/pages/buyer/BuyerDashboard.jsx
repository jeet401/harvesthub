import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'

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
      <div style={{ padding: 24 }}>
        <div style={{ height: 32, background: '#e5e7eb', borderRadius: 8, width: '33%', marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 128, background: '#e5e7eb', borderRadius: 8 }} />
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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#111827' }}>
          Welcome back, {profile?.full_name || 'Buyer'}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Dashboard Overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {statCards.map((stat, index) => (
          <div key={index} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', margin: 0 }}>{stat.title}</h3>
              <div style={{ padding: 8, borderRadius: 8, background: stat.bgColor.replace('bg-', '#').replace('-100', '20') }}>
                <span style={{ fontSize: 16 }}>{stat.icon}</span>
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Shop by Category</h2>
          <Link to="/buyer/products" style={{ color: '#16a34a', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>View All</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              to={`/buyer/products?category=${category.id}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ padding: 12, borderRadius: 8, background: getCategoryColor(category.type).includes('red') ? '#fef2f2' : '#f0fdf4', marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{getCategoryIcon(category.type)}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, textAlign: 'center' }}>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Featured Products</h2>
          <Link to="/buyer/products" style={{ color: '#16a34a', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>View All</Link>
        </div>
        {featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>
            <span style={{ fontSize: 48, opacity: 0.5 }}>📦</span>
            <p style={{ marginTop: 16 }}>No featured products available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {featuredProducts.map((product) => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                <div style={{ aspectRatio: '1 / 1', background: '#f3f4f6', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                  <img src={product.image_url || '/placeholder.svg'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{product.name}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{product.description || 'Fresh produce from local farmers'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>₹{product.price}</span>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>/{product.unit}</span>
                    </div>
                    <button style={{ background: '#16a34a', color: '#fff', padding: '6px 12px', borderRadius: 6, border: 0, fontSize: 14, fontWeight: 500 }}>Add to Cart</button>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    by {product.farmer?.full_name} • {product.farmer?.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px 0' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Link to="/buyer/products" style={{ background: '#16a34a', color: '#fff', padding: '16px', borderRadius: 8, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 64 }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>📦</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Browse Products</span>
          </Link>
          <Link to="/buyer/cart" style={{ border: '1px solid #e5e7eb', color: '#111827', padding: '16px', borderRadius: 8, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 64 }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>🛒</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>View Cart</span>
          </Link>
          <Link to="/buyer/orders" style={{ border: '1px solid #e5e7eb', color: '#111827', padding: '16px', borderRadius: 8, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 64 }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>📈</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>My Orders</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
