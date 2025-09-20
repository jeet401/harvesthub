"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Package, Calendar, MapPin } from "lucide-react"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  shipping_address: string
  order_items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      farmer: {
        full_name: string
      }
    }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLanguage()

  const ordersTranslations = {
    en: {
      title: "My Orders",
      subtitle: "Track your order history",
      noOrders: "No orders found",
      noOrdersDesc: "You haven't placed any orders yet",
      startShopping: "Start Shopping",
      orderNumber: "Order #",
      total: "Total",
      items: "items",
      status: "Status",
      orderedOn: "Ordered on",
      deliveryAddress: "Delivery Address",
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      by: "by",
    },
    hi: {
      title: "मेरे ऑर्डर",
      subtitle: "अपने ऑर्डर इतिहास को ट्रैक करें",
      noOrders: "कोई ऑर्डर नहीं मिला",
      noOrdersDesc: "आपने अभी तक कोई ऑर्डर नहीं दिया है",
      startShopping: "खरीदारी शुरू करें",
      orderNumber: "ऑर्डर #",
      total: "कुल",
      items: "आइटम",
      status: "स्थिति",
      orderedOn: "ऑर्डर दिया गया",
      deliveryAddress: "डिलीवरी पता",
      pending: "लंबित",
      confirmed: "पुष्ट",
      shipped: "भेजा गया",
      delivered: "डिलीवर किया गया",
      by: "द्वारा",
    },
  }

  const ot = ordersTranslations[language]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            product:products(
              name,
              farmer:profiles(full_name)
            )
          )
        `)
        .eq("buyer_id", userData.user.id)
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
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
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/buyer/products">{ot.startShopping}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {ot.orderNumber}
                      {order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {ot.orderedOn} {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                      <span>
                        {order.order_items.length} {ot.items}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {ot[order.status as keyof typeof ot] || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-gray-600 ml-2">
                          {ot.by} {item.product.farmer.full_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div>
                          {item.quantity} × ₹{item.price}
                        </div>
                        <div className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="pt-2 border-t">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{ot.deliveryAddress}</p>
                      <p className="text-gray-600">{order.shipping_address}</p>
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
