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
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Leaf, Users, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "farmer" || type === "buyer") {
      setFormData((prev) => ({ ...prev, userType: type }))
    }
  }, [searchParams.get("type")]) // Use the actual value instead of the searchParams object

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(signUpTranslations[language].passwordMismatch)
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(signUpTranslations[language].passwordTooShort)
      setIsLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/${formData.userType}/dashboard`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        },
      })

      if (authError) throw authError
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.log("[v0] Sign up error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const signUpTranslations = {
    en: {
      title: "Join FarmByte",
      subtitle: "Create your account to get started",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      pincode: "PIN Code",
      userType: "I am a",
      farmer: "Farmer",
      buyer: "Buyer",
      signUp: "Create Account",
      signingUp: "Creating Account...",
      haveAccount: "Already have an account?",
      signIn: "Sign In",
      backToHome: "Back to Home",
      emailPlaceholder: "Enter your email address",
      passwordPlaceholder: "Create a strong password",
      confirmPasswordPlaceholder: "Confirm your password",
      fullNamePlaceholder: "Enter your full name",
      phonePlaceholder: "Enter your phone number",
      addressPlaceholder: "Enter your address",
      cityPlaceholder: "Enter your city",
      statePlaceholder: "Enter your state",
      pincodePlaceholder: "Enter PIN code",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters long",
    },
    hi: {
      title: "FarmByte में शामिल हों",
      subtitle: "शुरू करने के लिए अपना खाता बनाएं",
      email: "ईमेल पता",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      fullName: "पूरा नाम",
      phone: "फोन नंबर",
      address: "पता",
      city: "शहर",
      state: "राज्य",
      pincode: "पिन कोड",
      userType: "मैं हूँ",
      farmer: "किसान",
      buyer: "खरीदार",
      signUp: "खाता बनाएं",
      signingUp: "खाता बनाया जा रहा है...",
      haveAccount: "पहले से खाता है?",
      signIn: "साइन इन",
      backToHome: "होम पर वापस",
      emailPlaceholder: "अपना ईमेल पता दर्ज करें",
      passwordPlaceholder: "एक मजबूत पासवर्ड बनाएं",
      confirmPasswordPlaceholder: "अपने पासवर्ड की पुष्टि करें",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      phonePlaceholder: "अपना फोन नंबर दर्ज करें",
      addressPlaceholder: "अपना पता दर्ज करें",
      cityPlaceholder: "अपना शहर दर्ज करें",
      statePlaceholder: "अपना राज्य दर्ज करें",
      pincodePlaceholder: "पिन कोड दर्ज करें",
      passwordMismatch: "पासवर्ड मेल नहीं खाते",
      passwordTooShort: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
    },
  }

  const st = signUpTranslations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            {st.backToHome}
          </Link>
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
            <CardTitle className="text-2xl">{st.title}</CardTitle>
            <CardDescription>{st.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="userType">{st.userType}</Label>
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
                        {st.buyer}
                      </div>
                    </SelectItem>
                    <SelectItem value="farmer">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        {st.farmer}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{st.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={st.emailPlaceholder}
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">{st.fullName}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={st.fullNamePlaceholder}
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">{st.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={st.passwordPlaceholder}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{st.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={st.confirmPasswordPlaceholder}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{st.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={st.phonePlaceholder}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{st.address}</Label>
                <Textarea
                  id="address"
                  placeholder={st.addressPlaceholder}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">{st.city}</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder={st.cityPlaceholder}
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">{st.state}</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder={st.statePlaceholder}
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>

                {/* PIN Code */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">{st.pincode}</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder={st.pincodePlaceholder}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? st.signingUp : st.signUp}
              </Button>

              <div className="text-center text-sm">
                {st.haveAccount}{" "}
                <Link
                  href={`/auth/login?type=${formData.userType}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {st.signIn}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
