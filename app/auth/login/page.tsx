"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Leaf, Users, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"farmer" | "buyer">("buyer")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()

  useEffect(() => {
    // Get user type from URL params
    const type = searchParams.get("type")
    if (type === "farmer" || type === "buyer") {
      setUserType(type)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError

      // Get user profile to check user type
      const { data: profile, error: profileError } = await supabase.from("profiles").select("user_type").single()

      if (profileError) {
        console.log("[v0] Profile fetch error:", profileError)
        // If profile doesn't exist, redirect to complete profile
        router.push("/auth/complete-profile")
        return
      }

      // Redirect based on user type
      if (profile.user_type === "farmer") {
        router.push("/farmer/dashboard")
      } else {
        router.push("/buyer/dashboard")
      }
    } catch (error: unknown) {
      console.log("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const loginTranslations = {
    en: {
      title: "Sign In to FarmByte",
      subtitle: "Welcome back! Please sign in to your account",
      email: "Email",
      password: "Password",
      userType: "I am a",
      farmer: "Farmer",
      buyer: "Buyer",
      signIn: "Sign In",
      signingIn: "Signing In...",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      backToHome: "Back to Home",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
    },
    hi: {
      title: "FarmByte में साइन इन करें",
      subtitle: "वापस स्वागत है! कृपया अपने खाते में साइन इन करें",
      email: "ईमेल",
      password: "पासवर्ड",
      userType: "मैं हूँ",
      farmer: "किसान",
      buyer: "खरीदार",
      signIn: "साइन इन",
      signingIn: "साइन इन हो रहा है...",
      noAccount: "खाता नहीं है?",
      signUp: "साइन अप",
      backToHome: "होम पर वापस",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    },
  }

  const lt = loginTranslations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            {lt.backToHome}
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
            <CardTitle className="text-2xl">{lt.title}</CardTitle>
            <CardDescription>{lt.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="userType">{lt.userType}</Label>
                <Select value={userType} onValueChange={(value: "farmer" | "buyer") => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {lt.buyer}
                      </div>
                    </SelectItem>
                    <SelectItem value="farmer">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        {lt.farmer}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{lt.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={lt.emailPlaceholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{lt.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={lt.passwordPlaceholder}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? lt.signingIn : lt.signIn}
              </Button>

              <div className="text-center text-sm">
                {lt.noAccount}{" "}
                <Link
                  href={`/auth/sign-up?type=${userType}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {lt.signUp}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
