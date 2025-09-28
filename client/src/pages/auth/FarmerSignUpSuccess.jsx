import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Sprout, Truck, BarChart3, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

export default function FarmerSignUpSuccess() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/farmer/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleGoToDashboard = () => {
    navigate('/farmer/dashboard')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
            <Sprout className="w-4 h-4 text-white absolute translate-x-2 translate-y-2" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome, Farmer!
          </h1>
          <p className="text-gray-600 mb-8">
            Your farmer account has been created successfully
          </p>

          {/* What's Next Section */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-700">
                <Sprout className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                List your quality agricultural products
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <Users className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                Connect directly with buyers nationwide
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <Truck className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                Manage your orders and deliveries
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <BarChart3 className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                Track sales analytics and market trends
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Sprout className="w-4 h-4 mr-2" />
              Go to Farmer Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="w-full"
            >
              Back to Homepage
            </Button>
          </div>

          {/* Countdown */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-green-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}