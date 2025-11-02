import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Users, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [categoryStats, setCategoryStats] = useState([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch main stats
      const statsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/stats`, {
        credentials: 'include'
      })

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }

      // Fetch category stats
      const categoryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/categories`, {
        credentials: 'include'
      })

      if (categoryResponse.ok) {
        const data = await categoryResponse.json()
        setCategoryStats(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/revenue?period=${period}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setRevenueData(data.revenueData || [])
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive platform insights and metrics</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <>
          {/* User Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.users.total}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Buyers</p>
                      <p className="text-3xl font-bold mt-2">{stats.users.buyers}</p>
                    </div>
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Farmers</p>
                      <p className="text-3xl font-bold mt-2">{stats.users.farmers}</p>
                    </div>
                    <Users className="w-10 h-10 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Admins</p>
                      <p className="text-3xl font-bold mt-2">{stats.users.admins}</p>
                    </div>
                    <Users className="w-10 h-10 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-3xl font-bold mt-2">{stats.products.total}</p>
                    </div>
                    <Package className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Products</p>
                      <p className="text-3xl font-bold mt-2">{stats.products.active}</p>
                    </div>
                    <Package className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                      <p className="text-3xl font-bold mt-2">{stats.products.pending}</p>
                    </div>
                    <Package className="w-10 h-10 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-bold mt-2">{stats.orders.total}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold mt-2">{stats.orders.pending}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-3xl font-bold mt-2">{stats.orders.completed}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold mt-2">₹{stats.revenue.total.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Revenue Trend</CardTitle>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <div className="space-y-2">
              {revenueData.map((data, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">{data._id}</div>
                  <div className="flex-1 bg-muted/30 rounded-full h-8 relative">
                    <div
                      className="bg-primary rounded-full h-8 flex items-center justify-end pr-3 text-white text-sm font-medium"
                      style={{
                        width: `${Math.min((data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100, 100)}%`
                      }}
                    >
                      ₹{data.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-20 text-sm text-right">{data.orders} orders</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No revenue data available</p>
          )}
        </CardContent>
      </Card>

      {/* Category Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length > 0 ? (
            <div className="space-y-4">
              {categoryStats.slice(0, 10).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cat.count} products
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{Math.round(cat.avgPrice)}</div>
                    <div className="text-sm text-muted-foreground">Avg. Price</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No category data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
