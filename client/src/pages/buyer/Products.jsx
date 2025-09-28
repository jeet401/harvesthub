import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Products() {
  const { user } = useAuth()
  const { addToCart: addToCartContext } = useCart()
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
      setIsLoading(true);
      
      // Try to fetch products from backend API first
      let apiProducts = [];
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          apiProducts = data.products || [];
          console.log('Fetched products from database:', apiProducts);
          
          // Transform backend data to match frontend expectations
          apiProducts = apiProducts.map(product => ({
            ...product,
            name: product.title,
            quantity: product.stock,
            category: { 
              name: product.categoryId?.name || product.categoryName || 'Unknown',
              _id: product.categoryId?._id
            },
            seller: { 
              name: product.sellerId?.name || product.sellerName || 'Local Farmer',
              location: product.location || 'India' 
            },
            rating: product.rating || 4.5,
            reviewsCount: product.reviewsCount || Math.floor(Math.random() * 20) + 1,
            images: product.images && product.images.length > 0 
              ? product.images 
              : ['/placeholder.jpg']
          }));
        } else {
          console.log('API failed, using fallback data');
        }
      } catch (apiError) {
        console.log('API not available, using fallback data');
      }

      // Get farmer-added products from localStorage
      const farmerProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const localStorageProducts = farmerProducts.map(product => ({
        ...product,
        category: { name: product.categoryName || 'Other' },
        seller: { name: 'Local Farmer', location: product.location || 'Punjab, India' },
        rating: product.rating || 4.5,
        reviewsCount: product.reviewsCount || Math.floor(Math.random() * 20) + 1
      }));
      
      // Mock products for demo (only if no real products)
      const mockProducts = apiProducts.length > 0 ? [] : [
        {
          _id: 'mock1',
          title: 'Fresh Organic Tomatoes',
          name: 'Fresh Organic Tomatoes',
          price: 40,
          stock: 200,
          quantity: 200,
          unit: 'kg',
          images: ['/fresh-vegetables-tomatoes-carrots-onions.png'],
          description: 'Fresh organic tomatoes grown without pesticides',
          category: { name: 'Vegetables' },
          seller: { name: 'Ram Singh', location: 'Punjab' },
          rating: 4.8,
          reviewsCount: 15
        },
        {
          _id: 'mock2',
          title: 'Premium Basmati Rice',
          name: 'Premium Basmati Rice',
          price: 80,
          stock: 500,
          quantity: 500,
          unit: 'kg',
          images: ['/various-seeds-packets-wheat-rice-vegetable-seeds.png'],
          description: 'Premium quality basmati rice',
          category: { name: 'Grains & Cereals' },
          seller: { name: 'Suresh Kumar', location: 'Haryana' },
          rating: 4.9,
          reviewsCount: 32
        }
      ];

      // Combine all products: API + localStorage + mock (if needed)
      const allProducts = [
        ...apiProducts,
        ...localStorageProducts,
        ...mockProducts
      ];

      // Filter products based on search term and category
      let filteredProducts = allProducts;
      
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => 
          product.category?.name === selectedCategory
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Products fetch error:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Try to fetch categories from backend API first
      let apiCategories = [];
      try {
        const response = await fetch('http://localhost:5000/api/products/categories', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          apiCategories = data.categories || [];
          console.log('Fetched categories from database:', apiCategories);
        } else {
          console.log('Categories API failed, using fallback data');
        }
      } catch (apiError) {
        console.log('Categories API not available, using fallback data');
      }

      // Mock categories as fallback
      const mockCategories = [
        { _id: '1', name: 'Grains & Cereals' },
        { _id: '2', name: 'Vegetables' },
        { _id: '3', name: 'Fruits' },
        { _id: '4', name: 'Pulses & Legumes' },
        { _id: '5', name: 'Spices & Herbs' },
        { _id: '6', name: 'Seeds' },
        { _id: '7', name: 'Organic Products' },
        { _id: '8', name: 'Dairy Products' },
        { _id: '9', name: 'Nuts & Dry Fruits' },
        { _id: '10', name: 'Flowers' }
      ];

      // Use API categories if available, otherwise use mock categories
      const finalCategories = apiCategories.length > 0 ? apiCategories : mockCategories;
      setCategories(finalCategories);
    } catch (error) {
      console.error('Categories fetch error:', error);
      setCategories([]);
    }
  };

  const filteredProducts = products; // Products are already filtered in fetchProducts

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    setCartLoading(productId)
    try {
      const success = await addToCartContext(productId, 1)
      if (success) {
        alert('Added to cart!')
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
                  onClick={() => handleAddToCart(product._id)}
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
