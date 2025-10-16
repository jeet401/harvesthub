import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Search, MessageCircle, Package, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart
} from 'lucide-react';

const FarmerAnalytics = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Memoize chart data to prevent re-renders when search terms change
  const chartData = useMemo(() => analytics?.charts?.monthlyRevenue || [], [analytics?.charts?.monthlyRevenue]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedCategory]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.getFarmerAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (value) => `₹${(value || 0).toLocaleString()}`;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to navigate to chat with buyer
  const handleLiveChat = async (order) => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      const buyerId = order.userId?._id;
      const firstItem = order.items[0];
      const productId = firstItem.productId?._id;
      
      if (buyerId) {
        try {
          const conversationData = {
            participantId: buyerId,
            productId: productId,
            initialMessage: `Hi! I have an update about your order #${order._id?.slice(-8).toUpperCase()}`
          };
          
          await api.createConversation(conversationData);
          navigate(`/chat?buyer=${buyerId}&product=${productId}&order=${order._id}`);
        } catch (error) {
          console.error('Failed to start conversation:', error);
          navigate(`/chat?buyer=${buyerId}&product=${productId}&order=${order._id}`);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1d24]' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-32 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1d24]' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border text-center py-12`}>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              Analytics Error
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>
              {error}
            </p>
            <button 
              onClick={fetchAnalytics}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1d24]' : 'bg-gray-50'}`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Farmer Analytics</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Track your sales performance and product insights</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Total Revenue</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {formatCurrency(analytics?.summary?.totalRevenue || 0)}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className={`px-2 py-1 rounded ${
                analytics?.summary?.revenueGrowth >= 0 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {analytics?.summary?.revenueGrowth >= 0 ? '+' : ''}{analytics?.summary?.revenueGrowth || 0}%
              </span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>vs last month</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Total Orders</h3>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {analytics?.summary?.totalOrders || 0}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className={`px-2 py-1 rounded ${
                analytics?.summary?.orderGrowth >= 0 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {analytics?.summary?.orderGrowth >= 0 ? '+' : ''}{analytics?.summary?.orderGrowth || 0}%
              </span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>orders</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Products Listed</h3>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {analytics?.summary?.totalProducts || 0}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                Active
              </span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>products</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Total Customers</h3>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {analytics?.summary?.totalCustomers || 0}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                Unique
              </span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>buyers</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart - Full Width */}
        <div className="mb-8">
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Monthly Revenue</h3>
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-sm">
                  +{analytics?.summary?.revenueGrowth || 0}% Growth
                </span>
              </div>
              <div className="text-emerald-400 text-xl font-bold">
                {formatCurrency(analytics?.summary?.totalRevenue || 0)}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Performance and Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Top Products</h3>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className={`w-48 pl-10 pr-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              </div>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(analytics?.charts?.productPerformance || [])
                .filter(product => 
                  product.title.toLowerCase().includes(productSearchTerm.toLowerCase())
                )
                .slice(0, 5)
                .map((product, index) => (
                <div key={product._id} className={`grid grid-cols-12 gap-4 items-center px-3 py-3 ${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>
                        {product.title}
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                        {product.category}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
                      {product.totalSold || 0}
                    </div>
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                      sold
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
                      {product.orders || 0}
                    </div>
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                      orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-6`}>Order Status</h3>
            
            <div className="flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics?.charts?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {(analytics?.charts?.statusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.status === 'delivered' ? '#10b981' :
                        entry.status === 'shipped' ? '#3b82f6' :
                        entry.status === 'confirmed' ? '#f59e0b' :
                        '#6b7280'
                      } />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {(analytics?.charts?.statusDistribution || []).map((status, index) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{
                      backgroundColor: 
                        status.status === 'delivered' ? '#10b981' :
                        status.status === 'shipped' ? '#3b82f6' :
                        status.status === 'confirmed' ? '#f59e0b' :
                        '#6b7280'
                    }}></div>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                      {status.name}
                    </span>
                  </div>
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>
                    {status.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Recent Orders</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className={`w-40 pl-10 pr-4 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              </div>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-600 border-gray-200'} text-xs border-b`}>
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Buyer</th>
                  <th className="pb-3 font-medium">Order Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(analytics?.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No orders found
                    </td>
                  </tr>
                ) : (analytics?.recentOrders || [])
                  .filter(order => order && typeof order === 'object')
                  .filter(order => {
                    // Filter by search term
                    const searchMatch = orderSearchTerm === '' || 
                      order._id?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                      (Array.isArray(order.items) && order.items.some(item => 
                        item.productId?.title?.toLowerCase().includes(orderSearchTerm.toLowerCase())
                      ));
                    
                    // Filter by status
                    const statusMatch = orderFilter === 'all' || order.status === orderFilter;
                    
                    return searchMatch && statusMatch;
                  })
                  .slice(0, 10)
                  .map((order, index) => {
                    const buyerName = order.userId?.email?.split('@')[0] || 'Unknown Buyer';
                    const buyerInitials = buyerName.charAt(0).toUpperCase();
                    
                    return (
                      <tr key={order._id || index} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/20' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                        <td className={`py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-mono text-xs`}>
                          #{order._id ? order._id.slice(-8).toUpperCase() : `ORDER${index.toString().padStart(3, '0')}`}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>
                                {Array.isArray(order.items) && order.items.length > 0 
                                  ? order.items.map(item => item.productId?.title || 'Product').join(', ')
                                  : `${order.items?.length || 0} items`}
                              </div>
                              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                                {Array.isArray(order.items) ? order.items.length : 0} {(Array.isArray(order.items) ? order.items.length : 0) === 1 ? 'item' : 'items'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                              <span className="text-white text-xs font-medium">{buyerInitials}</span>
                            </div>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{buyerName}</span>
                          </div>
                        </td>
                        <td className={`py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                          {formatDate(order.createdAt || order.date)}
                        </td>
                        <td className={`py-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {formatCurrency(order.farmerRevenue || order.totalAmount)}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                            order.status === 'delivered' || order.status === 'completed' 
                              ? 'text-emerald-400 bg-emerald-500/10' :
                            order.status === 'shipped' 
                              ? 'text-blue-400 bg-blue-500/10' :
                            order.status === 'confirmed' || order.status === 'pending'
                              ? 'text-yellow-400 bg-yellow-500/10' :
                            'text-gray-400 bg-gray-500/10'
                          }`}>
                            {order.status === 'delivered' ? 'Complete' : 
                             order.status === 'shipped' ? 'Shipped' : 
                             order.status === 'confirmed' ? 'Confirmed' :
                             order.status === 'pending' ? 'Pending' :
                             order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleLiveChat(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAnalytics;