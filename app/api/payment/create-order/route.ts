import { type NextRequest, NextResponse } from "next/server"

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await request.json()

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 })
    }

    if (RAZORPAY_KEY_ID.includes("test") || RAZORPAY_KEY_SECRET.includes("test")) {
      const mockOrder = {
        id: `order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: "created",
      }

      return NextResponse.json({
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        keyId: RAZORPAY_KEY_ID,
      })
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1,
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order")
    }

    const order = await response.json()

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("[v0] Payment order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
