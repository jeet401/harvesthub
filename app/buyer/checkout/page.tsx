"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { loadRazorpayScript } from "@/lib/razorpay"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, Wallet, Smartphone } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
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

interface ShippingDetails {
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  notes: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  })
  const { language } = useLanguage()
  const router = useRouter()

  const checkoutTranslations = {
    en: {
      title: "Checkout",
      subtitle: "Complete your order",
      backToCart: "Back to Cart",
      shippingDetails: "Shipping Details",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      pincode: "PIN Code",
      notes: "Order Notes (Optional)",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      deliveryFee: "Delivery Fee",
      total: "Total",
      placeOrder: "Place Order",
      placingOrder: "Placing Order...",
      by: "by",
      free: "Free",
      required: "This field is required",
      paymentMethod: "Payment Method",
      payWithRazorpay: "Pay with Razorpay",
      paymentOptions: "UPI, Cards, Net Banking & Wallets",
      securePayment: "Secure Payment",
      processingPayment: "Processing Payment...",
      paymentFailed: "Payment failed. Please try again.",
    },
    hi: {
      title: "चेकआउट",
      subtitle: "अपना ऑर्डर पूरा करें",
      backToCart: "कार्ट पर वापस जाएं",
      shippingDetails: "शिपिंग विवरण",
      fullName: "पूरा नाम",
      phone: "फोन नंबर",
      address: "पता",
      city: "शहर",
      state: "राज्य",
      pincode: "पिन कोड",
      notes: "ऑर्डर नोट्स (वैकल्पिक)",
      orderSummary: "ऑर्डर सारांश",
      subtotal: "उप-योग",
      deliveryFee: "डिलीवरी शुल्क",
      total: "कुल",
      placeOrder: "ऑर्डर दें",
      placingOrder: "ऑर्डर दिया जा रहा है...",
      by: "द्वारा",
      free: "मुफ्त",
      required: "यह फील्ड आवश्यक है",
      paymentMethod: "भुगतान विधि",
      payWithRazorpay: "Razorpay से भुगतान करें",
      paymentOptions: "UPI, कार्ड, नेट बैंकिंग और वॉलेट",
      securePayment: "सुरक्षित भुगतान",
      processingPayment: "भुगतान प्रक्रिया में...",
      paymentFailed: "भुगतान असफल। कृपया पुनः प्रयास करें।",
    },
  }

  const ct = checkoutTranslations[language]

  useEffect(() => {
    fetchCartItems()
    loadUserProfile()
  }, [])

  const fetchCartItems = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/auth/login")
        return
      }

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

      if (error) throw error

      if (!data || data.length === 0) {
        router.push("/buyer/cart")
        return
      }

      setCartItems(data)
    } catch (error) {
      console.log("[v0] Cart fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address, city, state, pincode")
        .eq("id", userData.user.id)
        .single()

      if (error) throw error
      if (data) {
        setShippingDetails({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          notes: "",
        })
      }
    } catch (error) {
      console.log("[v0] Profile load error:", error)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const calculateDeliveryFee = () => {
    return 0 // Free delivery for now
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee()
  }

  const handleInputChange = (field: keyof ShippingDetails, value: string) => {
    setShippingDetails((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const required = ["full_name", "phone", "address", "city", "state", "pincode"]
    return required.every((field) => shippingDetails[field as keyof ShippingDetails].trim() !== "")
  }

  const placeOrder = async () => {
    if (!validateForm()) {
      alert(ct.required)
      return
    }

    setIsPlacingOrder(true)

    try {
      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpayScript()
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load payment gateway")
      }

      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("User not authenticated")

      // Create order in database first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: userData.user.id,
          total_amount: calculateTotal(),
          shipping_address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`,
          phone: shippingDetails.phone,
          notes: shippingDetails.notes,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        farmer_id: item.product.farmer_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      // Create Razorpay order
      const paymentResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculateTotal(),
          receipt: orderData.id,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment order")
      }

      const paymentData = await paymentResponse.json()

      // Initialize Razorpay payment
      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "FarmByte",
        description: "Fresh produce from local farmers",
        order_id: paymentData.orderId,
        prefill: {
          name: shippingDetails.full_name,
          email: userData.user.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#16a34a",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                order_id: orderData.id,
              }),
            })

            if (verifyResponse.ok) {
              // Clear cart after successful payment
              await supabase.from("cart").delete().eq("buyer_id", userData.user.id)
              router.push(`/buyer/order-success?orderId=${orderData.id}`)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("[v0] Payment verification error:", error)
            alert(ct.paymentFailed)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false)
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.log("[v0] Order placement error:", error)
      alert("Failed to place order. Please try again.")
      setIsPlacingOrder(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/buyer/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {ct.backToCart}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{ct.title}</h1>
          <p className="text-gray-600">{ct.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Shipping Details Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {ct.shippingDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">{ct.fullName} *</Label>
                  <Input
                    id="full_name"
                    value={shippingDetails.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{ct.phone} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">{ct.address} *</Label>
                <Textarea
                  id="address"
                  value={shippingDetails.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">{ct.city} *</Label>
                  <Input
                    id="city"
                    value={shippingDetails.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">{ct.state} *</Label>
                  <Input
                    id="state"
                    value={shippingDetails.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">{ct.pincode} *</Label>
                  <Input
                    id="pincode"
                    value={shippingDetails.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">{ct.notes}</Label>
                <Textarea
                  id="notes"
                  value={shippingDetails.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special instructions for delivery..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {ct.paymentMethod}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{ct.payWithRazorpay}</h4>
                    <p className="text-sm text-gray-600">{ct.paymentOptions}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                {ct.securePayment}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ct.orderSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url || "/placeholder.svg?height=48&width=48&query=fresh produce"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">
                        {ct.by} {item.product.farmer.full_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × ₹{item.product.price}
                      </p>
                    </div>
                    <div className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>{ct.subtotal}:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{ct.deliveryFee}:</span>
                  <span className="text-green-600">{ct.free}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>{ct.total}:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={placeOrder}
                disabled={isPlacingOrder || !validateForm()}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPlacingOrder ? ct.processingPayment : ct.placeOrder}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
