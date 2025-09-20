"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Package, ShoppingCart, Heart, TrendingUp, Apple, Carrot, Sprout, Leaf } from "lucide-react"
import Link from "next/link"
import type { Product, Category } from "@/lib/types"

interface DashboardStats {
  totalProducts: number
  cartItems: number
  totalOrders: number
  favoriteProducts: number
}

export function BuyerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    cartItems: 0,
    totalOrders: 0,
    favoriteProducts: 0,
  })
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const { language } = useLanguage()

  const dashboardTranslations = {
    en: {
      welcome: "Welcome back",
      overview: "Dashboard Overview",
      totalProducts: "Available Products",
      cartItems: "Items in Cart",
      totalOrders: "Total Orders",
      favoriteProducts: "Favorite Products",
      featuredProducts: "Featured Products",
      categories: "Shop by Category",
      viewAll: "View All",
      addToCart: "Add to Cart",
      quickActions: "Quick Actions",
      browseProducts: "Browse Products",
      viewCart: "View Cart",
      myOrders: "My Orders",
      fruits: "Fresh Fruits",
      vegetables: "Vegetables",
      seeds: "Seeds",
      fertilizers: "Fertilizers",
      noFeatured: "No featured products available",
    },
    hi: {
      welcome: "वापस स्वागत है",
      overview: "डैशबोर्ड अवलोकन",
      totalProducts: "उपलब्ध उत्पाद",
      cartItems: "कार्ट में आइटम",
      totalOrders: "कुल ऑर्डर",
      favoriteProducts: "पसंदीदा उत्पाद",
      featuredProducts: "विशेष उत्पाद",
      categories: "श्रेणी के अनुसार खरीदारी",
      viewAll: "सभी देखें",
      addToCart: "कार्ट में जोड़ें",
      quickActions: "त्वरित कार्य",
      browseProducts: "उत्पाद ब्राउज़ करें",
      viewCart: "कार्ट देखें",
      myOrders: "मेरे ऑर्डर",
      fruits: "ताजे फल",
      vegetables: "सब्जियां",
      seeds: "बीज",
      fertilizers: "उर्वरक",
      noFeatured: "कोई विशेष उत्पाद उपलब्ध नहीं",
    },
  }

  const dt = dashboardTranslations[language]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    try {
      // Get user profile
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

      setProfile(profileData)

      // Get stats
      const [productsResult, cartResult, ordersResult, categoriesResult] = await Promise.all([
        supabase.from("products").select("id").eq("is_active", true),
        supabase.from("cart").select("quantity").eq("buyer_id", userData.user.id),
        supabase.from("orders").select("id").eq("buyer_id", userData.user.id),
        supabase.from("categories").select("*").order("name"),
      ])

      console.log("[v0] Products query result:", productsResult)
      console.log("[v0] Cart query result:", cartResult)

      const totalProducts = productsResult.data?.length || 0
      const cartItems = cartResult.data?.reduce((sum, item) => sum + item.quantity, 0) || 0
      const totalOrders = ordersResult.data?.length || 0

      setStats({
        totalProducts,
        cartItems,
        totalOrders,
        favoriteProducts: 0, // TODO: Implement favorites
      })

      setCategories(categoriesResult.data || [])

      // Get featured products (latest 6 products)
      console.log("[v0] Fetching featured products...")
      const { data: featuredData, error: featuredError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          farmer:profiles(full_name, city)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6)

      console.log("[v0] Featured products result:", featuredData)
      console.log("[v0] Featured products error:", featuredError)

      setFeaturedProducts(featuredData || [])
    } catch (error) {
      console.log("[v0] Dashboard data fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "fruits":
        return Apple
      case "vegetables":
        return Carrot
      case "seeds":
        return Sprout
      case "fertilizers":
        return Leaf
      default:
        return Package
    }
  }

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "fruits":
        return "bg-red-100 text-red-600"
      case "vegetables":
        return "bg-orange-100 text-orange-600"
      case "seeds":
        return "bg-green-100 text-green-600"
      case "fertilizers":
        return "bg-emerald-100 text-emerald-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: dt.totalProducts,
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: dt.cartItems,
      value: stats.cartItems,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: dt.totalOrders,
      value: stats.totalOrders,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: dt.favoriteProducts,
      value: stats.favoriteProducts,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {dt.welcome}, {profile?.full_name || "Buyer"}!
        </h1>
        <p className="text-gray-600">{dt.overview}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{dt.categories}</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/buyer/products">{dt.viewAll}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => {
              const IconComponent = getCategoryIcon(category.type)
              return (
                <Link
                  key={category.id}
                  href={`/buyer/products?category=${category.id}`}
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className={`p-3 rounded-lg ${getCategoryColor(category.type)} mb-2`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{category.name}</span>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{dt.featuredProducts}</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/buyer/products">{dt.viewAll}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{dt.noFeatured}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={product.image_url || "/placeholder.svg?height=200&width=200&query=fresh produce"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                        <span className="text-sm text-gray-500">/{product.unit}</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        {dt.addToCart}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      by {product.farmer?.full_name} • {product.farmer?.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{dt.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button asChild className="h-16 bg-green-600 hover:bg-green-700">
              <Link href="/buyer/products" className="flex flex-col">
                <Package className="h-6 w-6 mb-1" />
                {dt.browseProducts}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 bg-transparent">
              <Link href="/buyer/cart" className="flex flex-col">
                <ShoppingCart className="h-6 w-6 mb-1" />
                {dt.viewCart}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 bg-transparent">
              <Link href="/buyer/orders" className="flex flex-col">
                <TrendingUp className="h-6 w-6 mb-1" />
                {dt.myOrders}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
