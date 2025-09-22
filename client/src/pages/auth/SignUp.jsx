import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'

export default function SignUp() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const roleParam = params.get('type')
  const role = roleParam === 'farmer' ? 'farmer' : 'buyer'

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.signup({ email, password, role })
      navigate('/auth/complete-profile')
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create {role === 'farmer' ? 'Farmer' : 'Buyer'} Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email" 
                type="email" 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                type="password" 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
              {loading ? 'Creating...' : 'Sign up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


