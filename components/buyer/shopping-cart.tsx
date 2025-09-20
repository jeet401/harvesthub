"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  created_at: string
  product: {
    id: string
    name: string
    price: number
    unit: string
    image_url: string | null
    farmer: {
      full_name: string
      city: string
    }
  }
}

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const { language } = useLanguage()

  const cartTranslations = {
    en: {
      title: "Shopping Cart",
      subtitle: "Review your items before checkout",
      emptyCart: "Your cart is empty",
      emptyCartDesc: "Add some products to get started",
      continueShopping: "Continue Shopping",
      item: "Item",
      quantity: "Quantity",
      price: "Price",
      total: "Total",
      subtotal: "Subtotal",
      proceedToCheckout: "Proceed to Checkout",
      remove: "Remove",
      update: "Update",
      by: "by",
    },
    hi: {
      title: "शॉपिंग कार्ट",
      subtitle: "चेकआउट से पहले अपने आइटम की समीक्षा करें",
      emptyCart: "आपका कार्ट खाली है",
      emptyCartDesc: "शुरू करने के लिए कुछ उत्पाद जोड़ें",
      continueShopping: "खरीदारी जारी रखें",
      item: "आइटम",
      quantity: "मात्रा",
      price: "कीमत",
      total: "कुल",
      subtotal: "उप-योग",
      proceedToCheckout: "चेकआउट पर जाएं",
      remove: "हटाएं",
      update: "अपडेट",
      by: "द्वारा",
    },
  }

  const ct = cartTranslations[language]

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("cart")
        .select(`
          *,
          product:products(
            id,
            name,
            price,
            unit,
            image_url,
            farmer:profiles(full_name, city)
          )
        `)
        .eq("buyer_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.log("[v0] Cart fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const supabase = createClient()
    setIsUpdating(cartItemId)

    try {
      const { error } = await supabase.from("cart").update({ quantity: newQuantity }).eq("id", cartItemId)

      if (error) throw error
      fetchCartItems()
    } catch (error) {
      console.log("[v0] Quantity update error:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("cart").delete().eq("id", cartItemId)

      if (error) throw error
      fetchCartItems()
    } catch (error) {
      console.log("[v0] Remove item error:", error)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">{ct.title}</h1>
        <p className="text-gray-600">{ct.subtitle}</p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{ct.emptyCart}</h3>
                <p className="text-gray-500">{ct.emptyCartDesc}</p>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/buyer/products">{ct.continueShopping}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url || "/placeholder.svg?height=80&width=80&query=fresh produce"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {ct.by} {item.product.farmer.full_name} • {item.product.farmer.city}
                      </p>
                      <div className="text-lg font-bold text-green-600">
                        ₹{item.product.price} per {item.product.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating === item.id || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating === item.id}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[5rem]">
                        <div className="font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{ct.subtotal}:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" asChild>
                  <Link href="/buyer/checkout">{ct.proceedToCheckout}</Link>
                </Button>

                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/buyer/products">{ct.continueShopping}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
