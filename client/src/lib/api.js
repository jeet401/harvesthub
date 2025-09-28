const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  // Some endpoints may return empty body
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : null
}

export const api = {
  health: () => request('/api/health'),
  
  // Auth endpoints with role support
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: () => request('/api/auth/refresh', { method: 'POST' }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  completeProfile: (body) => request('/api/auth/complete-profile', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/api/auth/profile'),
  updateProfile: (body) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  
  // Admin endpoints
  getUsers: (params) => request(`/api/auth/users${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  
  // Products
  getProducts: (params) => request(`/api/products${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  getProduct: (id) => request(`/api/products/${id}`),
  getCategories: () => request('/api/products/categories'),
  
  // Cart
  getCart: () => request('/api/cart'),
  addToCart: (body) => request('/api/cart/add', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (id, body) => request(`/api/cart/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeFromCart: (id) => request(`/api/cart/${id}`, { method: 'DELETE' }),
  
  // Orders
  getOrders: () => request('/api/orders'),
  getOrder: (id) => request(`/api/orders/${id}`),
  
  // Payment
  createOrder: (body) => request('/api/payment/create-order', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (body) => request('/api/payment/verify', { method: 'POST', body: JSON.stringify(body) }),
}

export default api
