"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { ArrowRight, Leaf, Users } from "lucide-react"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-black">
              {t.hero.title}
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-black">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 text-black font-semibold text-xl px-6 py-2" asChild>
                <Link href="/auth/login?type=buyer" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.hero.signInBuyer}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-blue-600 text-black font-semibold text-xl px-6 py-2" asChild>
                <Link href="/auth/login?type=farmer" className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  {t.hero.signInFarmer}
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/farmers-market-with-fresh-vegetables-and-fruits--p.png"
              alt="Fresh vegetables and crops"
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
