import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { User, Tractor, Settings, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const type = params.get('type') || 'buyer'
  const role = ['buyer', 'farmer', 'admin'].includes(type) ? type : 'buyer'

  const roleConfig = {
    buyer: {
      title: 'Buyer Login',
      icon: User,
      description: 'Access your buyer dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      redirectPath: '/buyer/dashboard'
    },
    farmer: {
      title: 'Farmer Login',
      icon: Tractor,
      description: 'Access your farmer dashboard',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      redirectPath: '/farmer/dashboard'
    },
    admin: {
      title: 'Admin Login',
      icon: Settings,
      description: 'Access admin panel',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      redirectPath: '/admin/dashboard'
    }
  }

  const config = roleConfig[role]
  const Icon = config.icon

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await login({ email, password, role })
      console.log('Login successful:', response)
      console.log('Current role:', role)
      console.log('Response user role:', response.user?.role)
      
      // Navigate based on the actual user role returned from server, or fallback to form role
      const userRole = response.user?.role || role
      console.log('Final user role for navigation:', userRole)
      
      const dashboardPath = roleConfig[userRole]?.redirectPath || '/dashboard'
      console.log('Redirecting to:', dashboardPath)
      
      navigate(dashboardPath)
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className={`${config.bgColor} rounded-t-lg`}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Icon className={`w-8 h-8 ${config.color}`} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {config.title}
          </CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
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
              <div className="relative">
                <input 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              className="w-full"
            >
              {loading ? 'Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to={`/auth/sign-up?type=${role}`} 
                className="font-medium text-primary hover:underline"
              >
                Create {role} account
              </Link>
            </p>
          </div>

          {/* Role switching */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Login with a different role?
            </p>
            <div className="flex justify-center space-x-2">
              {Object.entries(roleConfig).map(([roleKey, roleInfo]) => {
                if (roleKey === role) return null
                const RoleIcon = roleInfo.icon
                return (
                  <Link
                    key={roleKey}
                    to={`/auth/login?type=${roleKey}`}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border hover:bg-gray-50 transition-colors ${roleInfo.color}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link 
              to="/auth/forgot-password" 
              className="text-xs text-gray-500 hover:text-primary"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


