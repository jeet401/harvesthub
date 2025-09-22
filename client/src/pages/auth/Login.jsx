import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { User, Tractor, Settings, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
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
      const response = await api.login({ email, password, role })
      console.log('Login successful:', response)
      
      // Navigate based on the actual user role returned from server
      const userRole = response.user?.role || role
      const dashboardPath = roleConfig[userRole]?.redirectPath || '/dashboard'
      navigate(dashboardPath)
    } catch (err) {
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
                  className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline
