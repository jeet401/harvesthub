"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
}

export function FarmerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const { language } = useLanguage()

  const dashboardTranslations = {
    en: {
      welcome: "Welcome back",
      overview: "Dashboard Overview",
      totalProducts: "Total Products",
      activeProducts: "Active Products",
      totalOrders: "Total Orders",
      totalRevenue: "Total Revenue",
      recentActivity: "Recent Activity",
      noActivity: "No recent activity",
      quickActions: "Quick Actions",
      addProduct: "Add New Product",
      viewOrders: "View Orders",
      manageProducts: "Manage Products",
    },
    hi: {
      welcome: "वापस स्वागत है",
      overview: "डैशबोर्ड अवलोकन",
      totalProducts: "कुल उत्पाद",
      activeProducts: "सक्रिय उत्पाद",
      totalOrders: "कुल ऑर्डर",
      totalRevenue: "कुल आय",
      recentActivity: "हाल की गतिविधि",
      noActivity: "कोई हाल की गतिविधि नहीं",
      quickActions: "त्वरित कार्य",
      addProduct: "नया उत्पाद जोड़ें",
      viewOrders: "ऑर्डर देखें",
      manageProducts: "उत्पाद प्रबंधित करें",
    },
  }

  const dt = dashboardTranslations[language]

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()

      try {
        // Get user profile
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

        setProfile(profileData)

        // Get products stats
        const { data: products } = await supabase.from("products").select("*").eq("farmer_id", userData.user.id)

        const totalProducts = products?.length || 0
        const activeProducts = products?.filter((p) => p.is_active).length || 0

        // Get orders stats
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("quantity, total_price")
          .eq("farmer_id", userData.user.id)

        const totalOrders = orderItems?.length || 0
        const totalRevenue = orderItems?.reduce((sum, item) => sum + item.total_price, 0) || 0

        setStats({
          totalProducts,
          activeProducts,
          totalOrders,
          totalRevenue,
        })
      } catch (error) {
        console.log("[v0] Dashboard data fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
      title: dt.activeProducts,
      value: stats.activeProducts,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: dt.totalOrders,
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: dt.totalRevenue,
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {dt.welcome}, {profile?.full_name || "Farmer"}!
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{dt.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <a
                href="/farmer/products?action=add"
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Package className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-700">{dt.addProduct}</span>
              </a>
              <a
                href="/farmer/orders"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-700">{dt.viewOrders}</span>
              </a>
              <a
                href="/farmer/products"
                className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-700">{dt.manageProducts}</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dt.recentActivity}</CardTitle>
            <CardDescription>{dt.noActivity}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{dt.noActivity}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
