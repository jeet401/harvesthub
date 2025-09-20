import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api.js'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const type = params.get('type') || 'buyer'

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.login({ email, password })
      navigate(type === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Sign in</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
        <button disabled={loading} style={{ padding: '12px 16px', background: '#16a34a', color: '#fff', borderRadius: 8, border: 0 }}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  )
}


