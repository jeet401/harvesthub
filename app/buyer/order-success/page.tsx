"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  shipping_address: string
  phone: string
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

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const successTranslations = {
    en: {
      title: "Order Placed Successfully!",
      subtitle: "Thank you for your order",
      orderNumber: "Order Number",
      orderTotal: "Order Total",
      deliveryAddress: "Delivery Address",
      orderItems: "Order Items",
      continueShopping: "Continue Shopping",
      viewOrders: "View My Orders",
      orderStatus: "Order Status",
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      by: "by",
    },
    hi: {
      title: "ऑर्डर सफलतापूर्वक दिया गया!",
      subtitle: "आपके ऑर्डर के लिए धन्यवाद",
      orderNumber: "ऑर्डर नंबर",
      orderTotal: "ऑर्डर कुल",
      deliveryAddress: "डिलीवरी पता",
      orderItems: "ऑर्डर आइटम",
      continueShopping: "खरीदारी जारी रखें",
      viewOrders: "मेरे ऑर्डर देखें",
      orderStatus: "ऑर्डर स्थिति",
      pending: "लंबित",
      confirmed: "पुष्ट",
      shipped: "भेजा गया",
      delivered: "डिलीवर किया गया",
      by: "द्वारा",
    },
  }

  const st = successTranslations[language]

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    const supabase = createClient()
    try {
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
        .eq("id", orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.log("[v0] Order fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Button asChild className="mt-4">
          <Link href="/buyer/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{st.title}</h1>
          <p className="text-gray-600">{st.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {st.orderNumber}: #{order.id.slice(0, 8)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{st.orderTotal}</p>
                <p className="text-lg font-bold text-green-600">₹{order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{st.orderStatus}</p>
                <p className="text-lg font-medium capitalize">{st[order.status as keyof typeof st] || order.status}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">{st.deliveryAddress}</p>
              <p className="font-medium">{order.shipping_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>{st.orderItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {st.by} {item.product.farmer.full_name}
                    </p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
            <Link href="/buyer/products">
              {st.continueShopping}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/buyer/orders">{st.viewOrders}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
