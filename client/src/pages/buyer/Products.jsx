import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api.js'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    const categoryParam = searchParams.get('category')
    if (categoryParam) setSelectedCategory(categoryParam)
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory
      
      const response = await api.getProducts(params)
      setProducts(response.products || [])
    } catch (error) {
      console.error('Products fetch error:', error)
      // Fallback to mock data if API fails
      setProducts([
        { _id: 1, title: 'Fresh Tomatoes', price: 80, unit: 'kg', images: ['/fresh-vegetables-tomatoes-carrots-onions.png'], sellerId: { email: 'john@example.com' }, categoryId: { name: 'Vegetables' } },
        { _id: 2, title: 'Organic Apples', price: 120, unit: 'kg', images: ['/fresh-colorful-fruits-apples-oranges-bananas.png'], sellerId: { email: 'jane@example.com' }, categoryId: { name: 'Fruits' } },
        { _id: 3, title: 'Wheat Seeds', price: 45, unit: 'kg', images: ['/various-seeds-packets-wheat-rice-vegetable-seeds.png'], sellerId: { email: 'mike@example.com' }, categoryId: { name: 'Seeds' } },
        { _id: 4, title: 'Organic Fertilizer', price: 200, unit: 'kg', images: ['/organic-fertilizer-bags-compost-natural-farming.png'], sellerId: { email: 'sarah@example.com' }, categoryId: { name: 'Fertilizers' } },
        { _id: 5, title: 'Carrots', price: 60, unit: 'kg', images: ['/fresh-vegetables-tomatoes-carrots-onions.png'], sellerId: { email: 'david@example.com' }, categoryId: { name: 'Vegetables' } },
        { _id: 6, title: 'Bananas', price: 40, unit: 'dozen', images: ['/fresh-colorful-fruits-apples-oranges-bananas.png'], sellerId: { email: 'lisa@example.com' }, categoryId: { name: 'Fruits' } },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setCategories([
        { id: 1, name: 'Fruits', type: 'fruits' },
        { id: 2, name: 'Vegetables', type: 'vegetables' },
        { id: 3, name: 'Seeds', type: 'seeds' },
        { id: 4, name: 'Fertilizers', type: 'fertilizers' },
      ])
    } catch (error) {
      console.error('Categories fetch error:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.categoryId?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = async (productId) => {
    try {
      await api.addToCart({ productId, quantity: 1 })
      alert('Added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add to cart. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ height: 32, background: '#e5e7eb', borderRadius: 8, width: '33%', marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 300, background: '#e5e7eb', borderRadius: 8 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>Browse Products</h1>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 300 }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 200 }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: selectedCategory === category.name ? '2px solid #16a34a' : '1px solid #e5e7eb',
                background: selectedCategory === category.name ? '#f0fdf4' : '#fff',
                color: selectedCategory === category.name ? '#16a34a' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filteredProducts.map((product) => (
              <div key={product._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1 / 1', background: '#f3f4f6', overflow: 'hidden' }}>
                  <img src={product.images?.[0] || '/placeholder.svg'} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                      {product.categoryId?.name}
                    </span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>In Stock</span>
                  </div>
                  <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 8px 0', fontSize: 18 }}>{product.title}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    {product.description || 'Fresh produce from local farmers'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹{product.price}</span>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>/{product.unit || 'kg'}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product._id)}
                      style={{ background: '#16a34a', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 0, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                    by {product.sellerId?.email}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <span style={{ fontSize: 48, opacity: 0.5 }}>🔍</span>
          <p style={{ marginTop: 16, fontSize: 18 }}>No products found</p>
          <p style={{ marginTop: 8 }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
