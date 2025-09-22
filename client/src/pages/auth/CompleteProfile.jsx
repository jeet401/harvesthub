import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Complete your profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Full name" 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div>
              <input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Phone" 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Address" 
                rows={4} 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
              />
            </div>
            {error && (
              <div className="text-destructive text-sm">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


