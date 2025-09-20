import { Link } from 'react-router-dom'

export default function OrderSuccess() {
  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>Order Placed Successfully!</h1>
        <p style={{ fontSize: 18, color: '#6b7280', margin: '0 0 24px 0' }}>
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/buyer/orders" style={{ background: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            View Orders
          </Link>
          <Link to="/buyer/products" style={{ border: '1px solid #e5e7eb', color: '#111827', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 500 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
