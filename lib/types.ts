// Type definitions for FarmByte marketplace
export interface Profile {
  id: string
  email: string
  full_name: string
  user_type: "farmer" | "buyer"
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  type: "fruits" | "vegetables" | "seeds" | "fertilizers"
  created_at: string
}

export interface Product {
  id: string
  farmer_id: string
  category_id: string
  name: string
  description?: string
  price: number
  unit: string
  quantity_available: number
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  farmer?: Profile
}

export interface CartItem {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Order {
  id: string
  buyer_id: string
  total_amount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  delivery_address: string
  payment_status: "pending" | "completed" | "failed"
  payment_id?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  farmer_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
  farmer?: Profile
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  user_type: "farmer" | "buyer"
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}
