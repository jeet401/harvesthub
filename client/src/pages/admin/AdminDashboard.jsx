import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Users, Package, ShoppingCart, TrendingUp, Settings, UserCheck, AlertCircle, RefreshCw, Award } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVerifications: 0,
    pendingAGMARK: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verify user is admin
    if (user && user.role !== 'admin') {
      navigate(`/${user.role}/dashboard`)
      return
    }
    
    fetchDashboardData()
    fetchRecentActivity()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please login as admin.')
          throw new Error('Unauthorized')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Admin stats:', data)
      
      setStats({
        totalUsers: data.users?.total || 0,
        totalProducts: data.products?.total || 0,
        totalOrders: data.orders?.total || 0,
        pendingVerifications: data.products?.pending || 0,
        pendingAGMARK: data.products?.pendingAGMARK || 0
      })
    } catch (error) {
      console.error('Admin dashboard fetch error:', error)
      setError(error.message)
      // Set zeros on error
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingVerifications: 0,
        pendingAGMARK: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/recent-activity?limit=10`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Recent activities:', data)
        setRecentActivities(data.activities || [])
      } else {
        console.error('Failed to fetch recent activity:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
    fetchRecentActivity()
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getActivityIconColor = (color) => {
    switch (color) {
      case 'blue': return 'text-blue-600'
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'purple': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      change: '+12%'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      change: '+8%'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      change: '+23%'
    },
    { 
      title: 'Pending Products', 
      value: stats.pendingVerifications, 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      change: '-5%'
    },
    { 
      title: 'AGMARK Verifications', 
      value: stats.pendingAGMARK, 
      icon: Award, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      change: 'Pending',
      link: '/admin/products?tab=agmark'
    },
  ]

  const quickActions = [
    { title: 'User Management', icon: Users, href: '/admin/users', description: 'Manage users and roles' },
    { title: 'Product Management', icon: Package, href: '/admin/products', description: 'Oversee product listings' },
    { title: 'Order Management', icon: ShoppingCart, href: '/admin/orders', description: 'Monitor all orders' },
    { title: 'Analytics', icon: TrendingUp, href: '/admin/analytics', description: 'View platform analytics' },
    { title: 'System Settings', icon: Settings, href: '/admin/settings', description: 'Configure platform settings' },
    { title: 'Verifications', icon: UserCheck, href: '/admin/verifications', description: 'Handle user verifications' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Platform Overview & Management {user?.email && `• Logged in as: ${user.email}`}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Error loading dashboard</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const CardWrapper = stat.link ? 'a' : 'div'
          const cardProps = stat.link ? { 
            href: stat.link, 
            onClick: (e) => {
              e.preventDefault()
              navigate(stat.link)
            },
            className: 'cursor-pointer hover:shadow-lg transition-shadow'
          } : {}
          
          return (
            <Card key={index} {...cardProps}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') 
                      ? 'bg-green-100 text-green-700'
                      : stat.change.startsWith('-')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted/50"
                  onClick={() => window.location.href = action.href}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">{action.description}</p>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon === 'Users' ? Users : 
                                     activity.icon === 'Package' ? Package : 
                                     ShoppingCart;
                const iconColor = getActivityIconColor(activity.color);
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <IconComponent className={`w-5 h-5 ${iconColor}`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description} - {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}