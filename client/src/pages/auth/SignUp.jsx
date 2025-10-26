import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { User, Tractor, Settings } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const roleParam = params.get('type')
  const role = ['buyer', 'farmer', 'admin'].includes(roleParam) ? roleParam : 'buyer'

  const roleConfig = {
    buyer: {
      title: 'Create Buyer Account',
      icon: User,
      description: 'Join as a buyer to source quality agricultural products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    farmer: {
      title: 'Create Farmer Account',
      icon: Tractor,
      description: 'Join as a farmer to sell your agricultural products',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    admin: {
      title: 'Create Admin Account',
      icon: Settings,
      description: 'Administrative access to manage the platform',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  }

  const config = roleConfig[role]
  const Icon = config.icon

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await signup({ email, password, role })
      console.log('Signup successful:', response)
      console.log('Signup role:', role)
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        // Pass role to complete profile page
        navigate('/auth/complete-profile', { 
          state: { userRole: response.user?.role || role } 
        })
      }
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex items-center justify-center p-4 transition-colors duration-300">
      <Card className="w-full max-w-md">
        <CardHeader className={`${config.bgColor} dark:bg-gray-800 rounded-t-lg transition-colors duration-300`}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm transition-colors duration-300">
              <Icon className={`w-8 h-8 ${config.color} dark:text-green-400`} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {config.title}
          </CardTitle>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">
            {config.description}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email" 
                type="email" 
                required 
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Create a password" 
                type="password" 
                required 
                minLength={6}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm your password" 
                type="password" 
                required 
                minLength={6}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            
            {error && (
              <div className="text-destructive text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? 'Creating Account...' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to={`/auth/login?type=${role}`} 
                className="font-medium text-primary hover:underline"
              >
                Sign in as {role}
              </Link>
            </p>
          </div>

          {/* Role switching */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Want to join with a different role?
            </p>
            <div className="flex justify-center space-x-2">
              {Object.entries(roleConfig).map(([roleKey, roleInfo]) => {
                if (roleKey === role) return null
                const RoleIcon = roleInfo.icon
                return (
                  <Link
                    key={roleKey}
                    to={`/auth/sign-up?type=${roleKey}`}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border hover:bg-gray-50 transition-colors ${roleInfo.color}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                  </Link>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
