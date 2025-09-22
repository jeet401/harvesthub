import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { User, MapPin, Phone, CheckCircle } from 'lucide-react'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { completeProfile } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    try {
      const response = await completeProfile({ 
        name: name.trim(), 
        phone: phone.trim(), 
        address: address.trim() 
      })
      
      console.log('Profile completed:', response)
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
        <CardHeader className="bg-primary/10 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Profile
          </CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            Just a few more details to get you started
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-8 h-0.5 bg-primary"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name" 
                required 
                maxLength={100}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter your phone number" 
                type="tel"
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +91 for India)
              </p>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter your complete address including city, state, and postal code" 
                rows={4} 
                required 
                maxLength={500}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {address.length}/500
              </div>
            </div>
            
            {error && (
              <div className="text-destructive text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Saving Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Profile
                </>
              )}
            </Button>
          </form>

          {/* Skip option for certain cases */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/auth/sign-up-success')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now (complete later)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
