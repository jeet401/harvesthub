"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { ArrowRight, Leaf, Users } from "lucide-react"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">{t.hero.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{t.hero.subtitle}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6" asChild>
                <Link href="/auth/login?type=buyer" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.hero.signInBuyer}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                asChild
              >
                <Link href="/auth/login?type=farmer" className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  {t.hero.signInFarmer}
                </Link>
              </Button>
            </div>

            <Button variant="link" className="text-green-600 p-0" asChild>
              <Link href="#how-it-works" className="flex items-center gap-2">
                {t.hero.learnMore}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 p-8">
              <img
                src="/farmers-market-with-fresh-vegetables-and-fruits--p.png"
                alt="FarmByte Marketplace"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Fresh Produce</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Direct from Farm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
