"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { BarChart3, Package, ShoppingCart, User, LogOut, Menu, X } from "lucide-react"

export function BuyerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  const sidebarTranslations = {
    en: {
      dashboard: "Dashboard",
      products: "Browse Products",
      cart: "Shopping Cart",
      orders: "My Orders",
      profile: "Profile",
      logout: "Logout",
    },
    hi: {
      dashboard: "डैशबोर्ड",
      products: "उत्पाद ब्राउज़ करें",
      cart: "शॉपिंग कार्ट",
      orders: "मेरे ऑर्डर",
      profile: "प्रोफ़ाइल",
      logout: "लॉग आउट",
    },
  }

  const st = sidebarTranslations[language]

  const navigation = [
    { name: st.dashboard, href: "/buyer/dashboard", icon: BarChart3 },
    { name: st.products, href: "/buyer/products", icon: Package },
    { name: st.cart, href: "/buyer/cart", icon: ShoppingCart, badge: cartCount },
    { name: st.orders, href: "/buyer/orders", icon: ShoppingCart },
    { name: st.profile, href: "/buyer/profile", icon: User },
  ]

  useEffect(() => {
    fetchCartCount()
  }, [])

  const fetchCartCount = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase.from("cart").select("quantity").eq("buyer_id", userData.user.id)

      if (error) throw error
      const totalItems = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(totalItems)
    } catch (error) {
      console.log("[v0] Cart count fetch error:", error)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-bold text-xl text-green-600">FarmByte</span>
            </div>
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-4">
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleLogout} className="w-full justify-start bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              {st.logout}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
