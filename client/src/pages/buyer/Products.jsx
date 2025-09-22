import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchParams] = useSearchParams()
  const [cartLoading, setCartLoading] = useState(null)

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
      
      // Try to fetch real products from API
      const response = await api.getProducts(params)
      setProducts(response.products || [])
    } catch (error) {
      console.error('Products fetch error:', error)
      // Fallback to empty array if API fails
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Categories fetch error:', error)
      // Fallback to default categories
      setCategories([
        { id: 1, name: 'Fruits', type: 'fruits' },
        { id: 2, name: 'Vegetables', type: 'vegetables' },
        { id: 3, name: 'Seeds', type: 'seeds' },
        { id: 4, name: 'Fertilizers', type: 'fertilizers' },
      ])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.categoryId?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    setCartLoading(productId)
    try {
      await api.addToCart({ productId, quantity: 1 })
      alert('Added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
      if (error.message.includes('Product not found')) {
        alert('This product is not available. Please try again later.')
      } else if (error.message.includes('not authenticated') || error.message.includes('token')) {
        alert('Please login again to add items to cart')
      } else {
        alert('Failed to add to cart. Please try again.')
      }
    } finally {
      setCartLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Browse Products</h1>
        
        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border border-border min-w-[300px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-lg border border-border min-w-[200px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-auto-fill gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="aspect-square bg-muted overflow-hidden">
              <img src={product.images?.[0] || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                  {product.categoryId?.name}
                </span>
                <span className="text-xs text-muted-foreground">In Stock</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">{product.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {product.description || 'Fresh produce from local farmers'}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-sm text-muted-foreground">/{product.unit || 'kg'}</span>
                </div>
                <Button
                  onClick={() => addToCart(product._id)}
                  size="sm"
                  disabled={cartLoading === product._id || !user}
                >
                  {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground border-t border-border pt-2">
                by {product.sellerId?.email}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <span className="text-5xl opacity-50">🔍</span>
          <p className="mt-4 text-lg">No products found</p>
          <p className="mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
