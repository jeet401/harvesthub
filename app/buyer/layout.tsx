import type React from "react"
import { BuyerSidebar } from "@/components/buyer/buyer-sidebar"
import { LanguageProvider } from "@/contexts/language-context"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <div className="flex h-screen bg-gray-50">
        <BuyerSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </LanguageProvider>
  )
}
