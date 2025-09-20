import { Link } from 'react-router-dom'

export default function SignUpSuccess() {
  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16, textAlign: 'center' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Profile completed!</h2>
      <p style={{ marginTop: 8 }}>You can now explore the marketplace.</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/buyer/products" style={{ background: '#16a34a', color: '#fff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>Browse products</Link>
      </div>
    </div>
  )
}


