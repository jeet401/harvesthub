"use client"

import { useLanguage } from "@/contexts/language-context"
import { Upload, Search, CreditCard, Truck } from "lucide-react"

export function HowItWorksSection() {
  const { t } = useLanguage()

  const steps = [
    {
      icon: Upload,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Search,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: CreditCard,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Truck,
      title: t.howItWorks.step4Title,
      description: t.howItWorks.step4Desc,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">{t.howItWorks.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.howItWorks.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto`}>
                <step.icon className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
