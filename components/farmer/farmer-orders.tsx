"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Package, Calendar, User, MapPin } from "lucide-react"

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product: {
    name: string
    unit: string
  }
  order: {
    id: string
    status: string
    delivery_address: string
    created_at: string
    buyer: {
      full_name: string
      phone: string
    }
  }
}

export function FarmerOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLanguage()

  const orderTranslations = {
    en: {
      title: "Orders",
      subtitle: "Manage orders for your products",
      noOrders: "No orders found",
      noOrdersDesc: "Orders for your products will appear here",
      orderFrom: "Order from",
      quantity: "Quantity",
      amount: "Amount",
      status: "Status",
      address: "Delivery Address",
      orderDate: "Order Date",
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
    hi: {
      title: "ऑर्डर",
      subtitle: "अपने उत्पादों के ऑर्डर प्रबंधित करें",
      noOrders: "कोई ऑर्डर नहीं मिला",
      noOrdersDesc: "आपके उत्पादों के ऑर्डर यहाँ दिखाई देंगे",
      orderFrom: "ऑर्डर से",
      quantity: "मात्रा",
      amount: "राशि",
      status: "स्थिति",
      address: "डिलीवरी पता",
      orderDate: "ऑर्डर की तारीख",
      pending: "लंबित",
      confirmed: "पुष्ट",
      shipped: "भेजा गया",
      delivered: "डिलीवर किया गया",
      cancelled: "रद्द",
    },
  }

  const ot = orderTranslations[language]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(name, unit),
          order:orders(
            id,
            status,
            delivery_address,
            created_at,
            buyer:profiles(full_name, phone)
          )
        `)
        .eq("farmer_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.log("[v0] Orders fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return ot.pending
      case "confirmed":
        return ot.confirmed
      case "shipped":
        return ot.shipped
      case "delivered":
        return ot.delivered
      case "cancelled":
        return ot.cancelled
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">{ot.title}</h1>
        <p className="text-gray-600">{ot.subtitle}</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{ot.noOrders}</h3>
                <p className="text-gray-500">{ot.noOrdersDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((orderItem) => (
            <Card key={orderItem.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{orderItem.product.name}</CardTitle>
                  <Badge className={getStatusColor(orderItem.order.status)}>
                    {getStatusText(orderItem.order.status)}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(orderItem.created_at).toLocaleDateString()}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{ot.orderFrom}:</span>
                      <span>{orderItem.order.buyer.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{ot.quantity}:</span>
                      <span>
                        {orderItem.quantity} {orderItem.product.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ot.amount}:</span>
                      <span className="text-green-600 font-semibold">₹{orderItem.total_price}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <span className="font-medium">{ot.address}:</span>
                        <p className="text-sm text-gray-600">{orderItem.order.delivery_address}</p>
                      </div>
                    </div>
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
