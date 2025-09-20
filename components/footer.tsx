"use client"

import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-bold text-xl text-green-400">FarmByte</span>
            </div>
            <p className="text-gray-400 leading-relaxed">{t.footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.quickLinks}</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                {t.nav.home}
              </Link>
              <Link href="#how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                {t.nav.howItWorks}
              </Link>
              <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">
                {t.nav.signIn}
              </Link>
              <Link href="/auth/sign-up" className="block text-gray-400 hover:text-white transition-colors">
                {t.nav.signUpFarmer}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.contact}</h3>
            <div className="space-y-2 text-gray-400">
              <p>support@farmbyte.com</p>
              <p>+91 12345 67890</p>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t.footer.followUs}</h3>
            <div className="text-gray-400">
              <p>Coming soon...</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
