"use client"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function Navbar() {
  const { t } = useLanguage()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-bold text-xl text-green-600">FarmByte</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-green-600 transition-colors">
              {t.nav.home}
            </Link>
            <Link href="#how-it-works" className="text-foreground hover:text-green-600 transition-colors">
              {t.nav.howItWorks}
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button variant="outline" asChild>
              <Link href="/auth/login">{t.nav.signIn}</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/sign-up?type=farmer">{t.nav.signUpFarmer}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
