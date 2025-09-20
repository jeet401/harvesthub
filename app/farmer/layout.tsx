import type React from "react"
import { FarmerSidebar } from "@/components/farmer/farmer-sidebar"
import { LanguageProvider } from "@/contexts/language-context"

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <div className="flex h-screen bg-gray-50">
        <FarmerSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </LanguageProvider>
  )
}
