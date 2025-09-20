import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FarmerDashboard } from "@/components/farmer/farmer-dashboard"

export default async function FarmerDashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is a farmer
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  if (!profile || profile.user_type !== "farmer") {
    redirect("/auth/login?type=farmer")
  }

  return <FarmerDashboard />
}
