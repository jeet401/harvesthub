import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { CheckCircle, ArrowRight, Home, User, Tractor, Settings } from 'lucide-react'

export default function SignUpSuccess() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState('buyer') // This should come from your auth context
  const [countdown, setCountdown] = useState(5)

  // You might want to get the user role from your auth context or API call
  // For now, I'll assume it's stored or can be retrieved

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirectToDashboard()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRedirectToDashboard = () => {
    const dashboardRoutes = {
      buyer: '/buyer/dashboard',
      farmer: '/farmer/dashboard',
      admin: '/admin/dashboard'
    }
    navigate(dashboardRoutes[userRole] || '/dashboard')
  }

  const roleConfig = {
    buyer: {
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Welcome, Buyer!',
      subtitle: 'Your buyer account has been created successfully',
      nextSteps: [
        'Browse quality agricultural products',
        'Connect directly with farmers',
        'Manage your orders and purchases',
        'Access market analytics and trends'
      ]
    },
    farmer: {
      icon: Tractor,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: 'Welcome, Farmer!',
      subtitle: 'Your farmer account has been created successfully',
      nextSteps: [
        'List your agricultural products',
        'Connect directly with buyers',
        'Manage your inventory and sales',
        'Get AGMARK certification for better prices'
      ]
    },
    admin: {
      icon: Settings,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      title: 'Welcome, Administrator!',
      subtitle: 'Your admin account has been created successfully',
      nextSteps: [
        'Monitor platform activities',
        'Manage user accounts and verification',
        'Access system analytics',
        'Configure platform settings'
      ]
    }
  }

  const config = roleConfig[userRole]
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className={`${config.bgColor} rounded-t-lg text-center`}>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-green-500">
                <Icon className={`w-3 h-3 ${config.color}`} />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {config.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {config.subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
            <ul className="space-y-2">
              {config.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRedirectToDashboard}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Icon className="w-4 h-4" />
              Go to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Back to Homepage
              </Link>
            </Button>
          </div>

          {countdown > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in {countdown} seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
