import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ShoppingCart } from "@/components/buyer/shopping-cart"

export default async function CartPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is a buyer
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

  if (!profile || profile.user_type !== "buyer") {
    redirect("/auth/login?type=buyer")
  }

  return <ShoppingCart />
}
