import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Users, Package, ShoppingCart, TrendingUp, Settings, UserCheck, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVerifications: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for admin dashboard
      setStats({
        totalUsers: 1247,
        totalProducts: 3892,
        totalOrders: 567,
        pendingVerifications: 23
      })
    } catch (error) {
      console.error('Admin dashboard fetch error:', error)
    } finally {
      setIsLoading(false)
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
      title: 'Pending Verifications', 
      value: stats.pendingVerifications, 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      change: '-5%'
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform Overview & Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
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
                      : 'bg-red-100 text-red-700'
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">New farmer registration</p>
                <p className="text-sm text-muted-foreground">John Doe registered as a farmer - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
              <Package className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Product verification needed</p>
                <p className="text-sm text-muted-foreground">Organic Tomatoes pending AGMARK verification - 15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Large order placed</p>
                <p className="text-sm text-muted-foreground">₹25,000 order for wheat seeds - 1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}