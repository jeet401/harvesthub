"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Search, Filter, ShoppingCart, MapPin } from "lucide-react"
import type { Product, Category } from "@/lib/types"

export function ProductBrowsing() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("")
  const { language } = useLanguage()

  const browsingTranslations = {
    en: {
      title: "Browse Products",
      subtitle: "Discover fresh produce from local farmers",
      search: "Search products...",
      allCategories: "All Categories",
      sortBy: "Sort by",
      newest: "Newest",
      priceAsc: "Price: Low to High",
      priceDesc: "Price: High to Low",
      nameAsc: "Name: A to Z",
      priceRange: "Price Range",
      allPrices: "All Prices",
      under50: "Under ₹50",
      range50to100: "₹50 - ₹100",
      range100to200: "₹100 - ₹200",
      above200: "Above ₹200",
      addToCart: "Add to Cart",
      noProducts: "No products found",
      tryDifferentFilters: "Try adjusting your search or filters",
      available: "Available",
      by: "by",
      filters: "Filters",
      clearFilters: "Clear Filters",
    },
    hi: {
      title: "उत्पाद ब्राउज़ करें",
      subtitle: "स्थानीय किसानों से ताजा उत्पाद खोजें",
      search: "उत्पाद खोजें...",
      allCategories: "सभी श्रेणियां",
      sortBy: "इसके अनुसार क्रमबद्ध करें",
      newest: "नवीनतम",
      priceAsc: "कीमत: कम से अधिक",
      priceDesc: "कीमत: अधिक से कम",
      nameAsc: "नाम: अ से ज्ञ",
      priceRange: "कीमत सीमा",
      allPrices: "सभी कीमतें",
      under50: "₹50 से कम",
      range50to100: "₹50 - ₹100",
      range100to200: "₹100 - ₹200",
      above200: "₹200 से अधिक",
      addToCart: "कार्ट में जोड़ें",
      noProducts: "कोई उत्पाद नहीं मिला",
      tryDifferentFilters: "अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें",
      available: "उपलब्ध",
      by: "द्वारा",
      filters: "फ़िल्टर",
      clearFilters: "फ़िल्टर साफ़ करें",
    },
  }

  const bt = browsingTranslations[language]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, sortBy, priceRange])

  const fetchProducts = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          farmer:profiles(full_name, city)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.log("[v0] Products fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.log("[v0] Categories fetch error:", error)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category_id === selectedCategory)
    }

    // Price range filter
    if (priceRange) {
      switch (priceRange) {
        case "under50":
          filtered = filtered.filter((product) => product.price < 50)
          break
        case "50to100":
          filtered = filtered.filter((product) => product.price >= 50 && product.price <= 100)
          break
        case "100to200":
          filtered = filtered.filter((product) => product.price >= 100 && product.price <= 200)
          break
        case "above200":
          filtered = filtered.filter((product) => product.price > 200)
          break
      }
    }

    // Sort
    switch (sortBy) {
      case "priceAsc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "priceDesc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "nameAsc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredProducts(filtered)
  }

  const addToCart = async (productId: string) => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from("cart")
        .select("*")
        .eq("buyer_id", userData.user.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)
        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart").insert({
          buyer_id: userData.user.id,
          product_id: productId,
          quantity: 1,
        })
        if (error) throw error
      }

      // Show success feedback (you could add a toast here)
      console.log("[v0] Added to cart successfully")
    } catch (error) {
      console.log("[v0] Add to cart error:", error)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setPriceRange("")
    setSortBy("newest")
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{bt.title}</h1>
        <p className="text-gray-600">{bt.subtitle}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={bt.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={bt.allCategories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bt.allCategories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder={bt.priceRange} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{bt.allPrices}</SelectItem>
                <SelectItem value="under50">{bt.under50}</SelectItem>
                <SelectItem value="50to100">{bt.range50to100}</SelectItem>
                <SelectItem value="100to200">{bt.range100to200}</SelectItem>
                <SelectItem value="above200">{bt.above200}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={bt.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{bt.newest}</SelectItem>
                <SelectItem value="priceAsc">{bt.priceAsc}</SelectItem>
                <SelectItem value="priceDesc">{bt.priceDesc}</SelectItem>
                <SelectItem value="nameAsc">{bt.nameAsc}</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              {bt.clearFilters}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{bt.noProducts}</h3>
                <p className="text-gray-500">{bt.tryDifferentFilters}</p>
              </div>
              <Button onClick={clearFilters} variant="outline" className="bg-transparent">
                {bt.clearFilters}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg?height=250&width=250&query=fresh produce"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.quantity_available} {bt.available}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {bt.by} {product.farmer?.full_name} • {product.farmer?.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => addToCart(product.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {bt.addToCart}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
