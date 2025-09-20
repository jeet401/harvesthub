import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.completeProfile({ name, phone, address })
      navigate('/auth/sign-up-success')
    } catch (err) {
      setError(err.message || 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Complete your profile</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" rows={4} required style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
        <button disabled={loading} style={{ padding: '12px 16px', background: '#16a34a', color: '#fff', borderRadius: 8, border: 0 }}>{loading ? 'Saving...' : 'Save and continue'}</button>
      </form>
    </div>
  )
}


