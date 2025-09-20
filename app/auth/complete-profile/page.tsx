"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Leaf, Users } from "lucide-react"

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    userType: "buyer" as "farmer" | "buyer",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { language } = useLanguage()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      // Pre-fill form with user metadata if available
      if (user.user_metadata) {
        setFormData({
          fullName: user.user_metadata.full_name || "",
          phone: user.user_metadata.phone || "",
          address: user.user_metadata.address || "",
          city: user.user_metadata.city || "",
          state: user.user_metadata.state || "",
          pincode: user.user_metadata.pincode || "",
          userType: user.user_metadata.user_type || "buyer",
        })
      }
    }

    checkUser()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: formData.fullName,
        user_type: formData.userType,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      })

      if (profileError) throw profileError

      // Redirect based on user type
      if (formData.userType === "farmer") {
        router.push("/farmer/dashboard")
      } else {
        router.push("/buyer/dashboard")
      }
    } catch (error: unknown) {
      console.log("[v0] Profile creation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred while creating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const completeTranslations = {
    en: {
      title: "Complete Your Profile",
      subtitle: "Please provide additional information to complete your account setup",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      pincode: "PIN Code",
      userType: "I am a",
      farmer: "Farmer",
      buyer: "Buyer",
      complete: "Complete Profile",
      completing: "Completing...",
      fullNamePlaceholder: "Enter your full name",
      phonePlaceholder: "Enter your phone number",
      addressPlaceholder: "Enter your address",
      cityPlaceholder: "Enter your city",
      statePlaceholder: "Enter your state",
      pincodePlaceholder: "Enter PIN code",
    },
    hi: {
      title: "अपनी प्रोफ़ाइल पूरी करें",
      subtitle: "कृपया अपने खाते की सेटअप पूरी करने के लिए अतिरिक्त जानकारी प्रदान करें",
      fullName: "पूरा नाम",
      phone: "फोन नंबर",
      address: "पता",
      city: "शहर",
      state: "राज्य",
      pincode: "पिन कोड",
      userType: "मैं हूँ",
      farmer: "किसान",
      buyer: "खरीदार",
      complete: "प्रोफ़ाइल पूरी करें",
      completing: "पूरा हो रहा है...",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      phonePlaceholder: "अपना फोन नंबर दर्ज करें",
      addressPlaceholder: "अपना पता दर्ज करें",
      cityPlaceholder: "अपना शहर दर्ज करें",
      statePlaceholder: "अपना राज्य दर्ज करें",
      pincodePlaceholder: "पिन कोड दर्ज करें",
    },
  }

  const ct = completeTranslations[language]

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold">FB</span>
              </div>
              <span className="font-bold text-2xl text-green-600">FarmByte</span>
            </div>
            <CardTitle className="text-2xl">{ct.title}</CardTitle>
            <CardDescription>{ct.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="userType">{ct.userType}</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: "farmer" | "buyer") => handleInputChange("userType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {ct.buyer}
                      </div>
                    </SelectItem>
                    <SelectItem value="farmer">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        {ct.farmer}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">{ct.fullName}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={ct.fullNamePlaceholder}
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{ct.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={ct.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{ct.address}</Label>
                <Textarea
                  id="address"
                  placeholder={ct.addressPlaceholder}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">{ct.city}</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder={ct.cityPlaceholder}
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">{ct.state}</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder={ct.statePlaceholder}
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>

                {/* PIN Code */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">{ct.pincode}</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder={ct.pincodePlaceholder}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? ct.completing : ct.complete}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
