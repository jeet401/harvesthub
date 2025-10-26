import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { User, Tractor, Settings, Eye, EyeOff } from 'lucide-react'
import MagicBento from '../../components/MagicBento.jsx'
import MagicCard from '../../components/MagicCard.jsx'

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
    <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex items-center justify-center p-4 transition-colors duration-300">
      <MagicCard className="w-full max-w-md" glowIntensity="high">
        <div className={`p-6 ${config.bgColor} dark:bg-gray-800 rounded-t-xl transition-colors duration-300`}>
          <div className="flex items-center justify-center mb-4 float-animation">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-lg glow-pulse transition-colors duration-300">
              <Icon className={`w-8 h-8 ${config.color} dark:text-green-400`} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
            {config.title} ✨
          </h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {config.description}
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-b-xl transition-colors duration-300">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-colors duration-300">Email Address</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email" 
                type="email" 
                required 
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
              <div className="relative">
                <input 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <MagicCard className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 transition-colors duration-300" glowIntensity="low">
                <p className="text-red-700 dark:text-red-400 text-sm transition-colors duration-300">{error}</p>
              </MagicCard>
            )}
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 glow-pulse"
            >
              {loading ? 'Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Don't have an account?{' '}
              <Link 
                to={`/auth/sign-up?type=${role}`} 
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors duration-200"
              >
                Create {role} account
              </Link>
            </p>
          </div>

          {/* Role switching */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 transition-colors duration-300">
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
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ${roleInfo.color} dark:text-green-400`}
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
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </MagicCard>
    </MagicBento>
  )
}


