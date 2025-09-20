// Razorpay configuration and utilities
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1234567890"
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_secret_key_1234567890"

export interface RazorpayOrderData {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
