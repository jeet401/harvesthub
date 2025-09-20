"use client"

import { useLanguage } from "@/contexts/language-context"
import { Apple, Carrot, Sprout, Leaf } from "lucide-react"

export function CategoriesSection() {
  const { t } = useLanguage()

  const categories = [
    {
      icon: Apple,
      title: t.categories.fruits,
      image: "/fresh-colorful-fruits-apples-oranges-bananas.png",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Carrot,
      title: t.categories.vegetables,
      image: "/fresh-vegetables-tomatoes-carrots-onions.png",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Sprout,
      title: t.categories.seeds,
      image: "/various-seeds-packets-wheat-rice-vegetable-seeds.png",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Leaf,
      title: t.categories.fertilizers,
      image: "/organic-fertilizer-bags-compost-natural-farming.png",
      color: "bg-emerald-100 text-emerald-600",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">{t.categories.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.categories.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square mb-4">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div
                  className={`absolute top-4 left-4 w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}
                >
                  <category.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center">{category.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
