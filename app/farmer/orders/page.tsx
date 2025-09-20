import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FarmerOrders } from "@/components/farmer/farmer-orders"

export default async function FarmerOrdersPage() {
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

  return <FarmerOrders />
}
