import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'
import { Button } from '../../components/ui/button'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

export default function Products() {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const { addToCart: addToCartContext } = useCart()
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedGrade, setSelectedGrade] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [searchParams] = useSearchParams()
  const [cartLoading, setCartLoading] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    const categoryParam = searchParams.get('category')
    if (categoryParam) setSelectedCategory(categoryParam)
  }, [searchParams])

  // Dynamic filtering effect
  useEffect(() => {
    applyFilters()
  }, [allProducts, searchTerm, selectedCategory, priceRange, selectedGrade, sortBy])

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
      const combinedProducts = [
        ...apiProducts,
        ...localStorageProducts,
        ...mockProducts
      ];

      // Add Agmark grades to products if not present
      const productsWithGrades = combinedProducts.map(product => ({
        ...product,
        agmarkGrade: product.agmarkGrade || ['A', 'B', 'C', 'Premium'][Math.floor(Math.random() * 4)]
      }));

      setAllProducts(productsWithGrades);
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

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category?.name === selectedCategory
      );
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => 
        product.price >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => 
        product.price <= parseFloat(priceRange.max)
      );
    }

    // Agmark grade filter
    if (selectedGrade) {
      filtered = filtered.filter(product => 
        product.agmarkGrade === selectedGrade
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'grade':
          const gradeOrder = { 'Premium': 4, 'A': 3, 'B': 2, 'C': 1 };
          return (gradeOrder[b.agmarkGrade] || 0) - (gradeOrder[a.agmarkGrade] || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSelectedGrade('');
    setSortBy('name');
  };

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

  const handleChatWithFarmer = async (product) => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to chat with farmers.')
      return
    }

    try {
      // Create or find conversation with this farmer for this product
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
        // Navigate to chat page
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
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="p-6">
          <div className={`h-8 rounded-lg w-1/3 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <MagicCard key={i} className="h-80 animate-pulse" />
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
      <div className="p-6">
        <div className="mb-6">
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent`}>
            Browse Products ✨
          </h1>
          
          {/* Search and Filters */}
          <MagicCard className="p-6 mb-6" glowIntensity="low">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`px-4 py-3 rounded-lg border-2 min-w-[300px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-3 rounded-lg border-2 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="grade">Grade: Premium First</option>
                </select>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="px-4 py-3"
                >
                  Clear All Filters
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex gap-4 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border-2 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>

                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className={`px-4 py-2 rounded-lg border-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">All Grades</option>
                  <option value="Premium">Premium</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border-2 w-24 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>to</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border-2 w-24 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || selectedCategory || selectedGrade || priceRange.min || priceRange.max) && (
                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedGrade && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                      Grade: {selectedGrade}
                    </span>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">
                      Price: ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </MagicCard>

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

        {/* Results Count */}
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} 
            {allProducts.length !== filteredProducts.length && ` out of ${allProducts.length} total`}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <span className="text-5xl opacity-50">🔍</span>
            <p className="mt-4 text-lg">No products found</p>
            <p className="mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-auto-fill gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filteredProducts.map((product) => (
              <MagicCard key={product._id} className="overflow-hidden" glowIntensity="medium">
                <div className={`aspect-square overflow-hidden ${isDarkMode 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <img 
                    src={product.images?.[0] || '/placeholder.svg'} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${isDarkMode 
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300' 
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                      }`}>
                        {product.category?.name || product.categoryId?.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                        product.agmarkGrade === 'Premium' 
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                          : product.agmarkGrade === 'A'
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : product.agmarkGrade === 'B'
                          ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        Grade {product.agmarkGrade}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>In Stock</span>
                  </div>
                  <h3 className={`font-semibold mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.title}</h3>
                  <p className={`text-sm mb-3 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {product.description || 'Fresh produce from local farmers'}
                  </p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-primary'}`}>₹{product.price}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>/{product.unit || 'kg'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product._id)}
                        size="sm"
                        disabled={cartLoading === product._id || !user}
                        className="flex-1"
                      >
                        {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
                      </Button>
                      <Button
                        onClick={() => handleChatWithFarmer(product)}
                        size="sm"
                        variant="outline"
                        disabled={!user || user.role !== 'buyer'}
                        className="flex-1"
                      >
                        💬 Chat
                      </Button>
                    </div>
                  </div>
                  <div className={`text-xs pt-2 border-t ${isDarkMode 
                    ? 'text-gray-400 border-gray-700' 
                    : 'text-muted-foreground border-border'
                  }`}>
                    by {product.sellerId?.email}
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        )}
      </div>
    </MagicBento>
  )
}
