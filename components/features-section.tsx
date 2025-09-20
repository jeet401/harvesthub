"use client"

import { useLanguage } from "@/contexts/language-context"
import { Truck, DollarSign, Shield, Heart } from "lucide-react"

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Truck,
      title: t.features.feature1Title,
      description: t.features.feature1Desc,
    },
    {
      icon: DollarSign,
      title: t.features.feature2Title,
      description: t.features.feature2Desc,
    },
    {
      icon: Shield,
      title: t.features.feature3Title,
      description: t.features.feature3Desc,
    },
    {
      icon: Heart,
      title: t.features.feature4Title,
      description: t.features.feature4Desc,
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">{t.features.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.features.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
