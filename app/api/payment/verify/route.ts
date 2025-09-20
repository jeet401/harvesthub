import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(request: NextRequest) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = await request.json()

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    if (!RAZORPAY_KEY_SECRET.includes("test")) {
      // Verify signature for real Razorpay keys
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex")

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
      }
    }

    // Update order payment status
    const supabase = createClient()
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "completed",
        payment_id: razorpay_payment_id,
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)

    if (error) {
      console.error("[v0] Order update error:", error)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
