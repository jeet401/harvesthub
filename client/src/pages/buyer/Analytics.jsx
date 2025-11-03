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
  Search, MessageCircle, Package
} from 'lucide-react';

const BuyerAnalytics = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('12months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Memoize chart data to prevent re-renders when search terms change
  const chartData = useMemo(() => analytics?.charts?.monthlySpending || [], [analytics?.charts?.monthlySpending]);

  // Function to navigate to chat with seller
  const handleLiveChat = async (order) => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      const firstItem = order.items[0];
      const sellerId = firstItem.sellerId?._id;
      const productId = firstItem.productId?._id;
      
      if (sellerId) {
        try {
          // Create or find existing conversation
          const conversationData = {
            participantId: sellerId,
            productId: productId,
            initialMessage: `Hi! I have a question about my order #${order._id?.slice(-8).toUpperCase()}`
          };
          
          await api.createConversation(conversationData);
          
          // Navigate to chat page
          navigate(`/chat?seller=${sellerId}&product=${productId}&order=${order._id}`);
        } catch (error) {
          console.error('Failed to start conversation:', error);
          // Still navigate to chat page even if conversation creation fails
          navigate(`/chat?seller=${sellerId}&product=${productId}&order=${order._id}`);
        }
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [dateRange, selectedCategory]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Pass filter parameters to API
      const params = { dateRange, category: selectedCategory !== 'all' ? selectedCategory : undefined };
      const data = await api.getBuyerAnalytics(params);
      
      // Use real data from API
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `₹${value?.toLocaleString() || 0}`;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Monthly Purchase Activity Chart with Curved Squares
  const PurchaseActivityChart = React.memo(({ data = [] }) => {
    const maxPurchases = useMemo(() => Math.max(...data.map(d => d.purchases || d.orders || 0), 1), [data]);
    
    // Get color intensity based on purchase count
    const getSquareColor = (purchases) => {
      const intensity = purchases / maxPurchases;
      if (intensity === 0) return isDarkMode ? '#1f2937' : '#e5e7eb'; // dark/light gray for no purchases
      if (intensity <= 0.2) return isDarkMode ? '#064e3b' : '#a7f3d0'; // very light green
      if (intensity <= 0.4) return isDarkMode ? '#065f46' : '#6ee7b7'; // light green
      if (intensity <= 0.6) return isDarkMode ? '#047857' : '#34d399'; // medium green
      if (intensity <= 0.8) return isDarkMode ? '#059669' : '#10b981'; // bright green
      return isDarkMode ? '#10b981' : '#059669'; // brightest green
    };

    // Create height levels for visual representation (like the chart columns)
    const createColumnSquares = (purchases, maxHeight = 8) => {
      const squares = [];
      const height = purchases === 0 ? 0 : Math.max(1, Math.ceil((purchases / maxPurchases) * maxHeight));
      
      for (let i = 0; i < maxHeight; i++) {
        const isActive = i < height;
        squares.push({
          id: i,
          isActive,
          color: isActive ? getSquareColor(purchases) : (isDarkMode ? '#1f2937' : '#f3f4f6'),
          purchases: isActive ? purchases : 0
        });
      }
      return squares.reverse(); // Bottom to top
    };

    const totalSpent = data.reduce((sum, d) => sum + (d.spent || 0), 0);
    const avgPurchases = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.purchases || d.orders || 0), 0) / data.length) : 0;
    const peakPurchases = Math.max(...data.map(d => d.purchases || d.orders || 0), 0);
    const growthRate = data.length >= 2 
      ? Math.round(((data[data.length - 1]?.purchases || 0) / (data[0]?.purchases || 1)) * 100)
      : 0;

    return (
      <div className="w-full">
        {/* Chart Value Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-emerald-400 text-3xl font-bold">
            {formatCurrency(totalSpent)}
          </div>
          {data.length > 0 && (
            <div className="text-right">
              <div className="text-emerald-400 text-lg">
                +{growthRate}%
              </div>
              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Growth rate</div>
            </div>
          )}
        </div>

        {/* Chart Container */}
        <div className="relative">
          {data.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-48 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-3">📈</div>
              <p className="font-medium">No purchase data available</p>
              <p className="text-sm mt-1">Start shopping to see your activity</p>
            </div>
          ) : (
            <>
              {/* Y-axis labels */}
              <div className="flex">
                <div className={`flex flex-col justify-between h-48 text-xs mr-6 py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  <span className="leading-none">{maxPurchases}</span>
                  <span className="leading-none">{Math.round(maxPurchases * 0.75)}</span>
                  <span className="leading-none">{Math.round(maxPurchases * 0.5)}</span>
                  <span className="leading-none">{Math.round(maxPurchases * 0.25)}</span>
                  <span className="leading-none">0</span>
                </div>
                
                {/* Chart Columns */}
                <div className="flex-1">
                  <div className="flex items-end justify-between h-48 gap-2">
                    {data.map((monthData, index) => {
                      const purchases = monthData.purchases || monthData.orders || 0;
                      const squares = createColumnSquares(purchases, 8);
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          {/* Column of squares */}
                          <div className="flex flex-col gap-1 items-center justify-end h-full">
                            {squares.map((square) => (
                              <div
                                key={square.id}
                                className={`w-6 h-6 rounded-lg cursor-pointer hover:scale-110 transition-all duration-200 ${isDarkMode ? 'border border-gray-800' : 'border border-gray-200'}`}
                                style={{ backgroundColor: square.color }}
                                title={`${monthData.month}: ${purchases} purchases - ${formatCurrency(monthData.spent || 0)}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-4 ml-6">
                {data.map((monthData, index) => (
                  <div key={index} className={`text-xs text-center flex-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {monthData.month}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 space-y-4">
                {/* Activity Legend */}
                <div className="flex items-center justify-center gap-4">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Less Activity</span>
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getSquareColor(intensity * maxPurchases) }}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>More Activity</span>
                </div>
                
                {/* Stats */}
                <div className={`flex items-center justify-center gap-6 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Avg: {avgPurchases} purchases/month</span>
                  <span>Peak: {peakPurchases} purchases</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1d24]' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 rounded w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-32 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 h-96 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-96 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
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
          <div className={`border border-red-700 rounded-lg text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-red-400">Analytics Error</h3>
            <p className="mb-4 text-red-300">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Analytics</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Track your purchasing behavior and spending insights</p>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Total Spent</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {formatCurrency(analytics?.summary?.totalSpent || 0)}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className={`px-2 py-1 rounded ${
                analytics?.summary?.spendingGrowth >= 0 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {analytics?.summary?.spendingGrowth >= 0 ? '+' : ''}{analytics?.summary?.spendingGrowth || 0}%
              </span>
              <span className="text-gray-500 ml-2">from last month</span>
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
              <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                {analytics?.summary?.totalOrders || 0} orders
              </span>
              <span className="text-gray-500 ml-2">all time</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Avg Order Value</h3>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {formatCurrency(analytics?.summary?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                {analytics?.summary?.totalItems || 0} items
              </span>
              <span className="text-gray-500 ml-2">purchased</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-lg border p-5 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Unique Sellers</h3>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <div className="mb-2">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>
                {analytics?.summary?.uniqueSellers || 0}
              </span>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                {analytics?.charts?.categorySpending?.length || 0} categories
              </span>
              <span className="text-gray-500 ml-2">explored</span>
            </div>
          </div>
        </div>

        {/* Main Charts Section - Purchase Activity Chart */}
        <div className="mb-8">
          {/* Purchase Activity Chart - Full Width */}
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Purchase Activity</h3>
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-sm">
                  +{analytics?.summary?.spendingGrowth || 0}% Increased vs last month
                </span>
              </div>
              <div className="text-emerald-400 text-xl font-bold">
                {formatCurrency(analytics?.summary?.totalSpent || 0)}
              </div>
            </div>
            
            <PurchaseActivityChart 
              data={chartData} 
            />
          </div>
        </div>

        {/* Product List and Category Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Product List */}
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
            
            {(analytics?.charts?.favoriteProducts || []).length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No product data available</p>
                <p className="text-sm mt-1">Start shopping to see your favorite products</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-gray-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Orders</div>
                </div>
                
                {/* Table Rows */}
                {(analytics?.charts?.favoriteProducts || [])
                  .filter(item => 
                    item.product?.title?.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.product?._id || index} className={`grid grid-cols-12 gap-4 items-center px-3 py-3 ${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {item.product?.title?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium text-sm truncate`}>
                            {item.product?.title || 'Unknown Product'}
                          </div>
                          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                            ₹{item.product?.price || 0} each
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-bold`}>{item.quantity || 0}</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-bold`}>{item.orders || 0}</div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>total orders</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Category Spending */}
          <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-6`}>Category Spending</h3>
            
            {(analytics?.charts?.categorySpending || []).length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-4xl mb-3">📊</div>
                <p>No category data available</p>
                <p className="text-sm mt-1">Make purchases to see spending breakdown</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={(analytics?.charts?.categorySpending || []).map((cat, index) => ({
                          ...cat,
                          color: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'][index % 5]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="spent"
                      >
                        {(analytics?.charts?.categorySpending || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#059669', '#047857', '#065f46', '#064e3b'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="space-y-3">
                  {(analytics?.charts?.categorySpending || []).slice(0, 5).map((cat, index) => {
                    const total = (analytics?.charts?.categorySpending || []).reduce((sum, c) => sum + c.spent, 0);
                    const percentage = total > 0 ? ((cat.spent / total) * 100).toFixed(0) : 0;
                    
                    return (
                      <div key={cat.category || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'][index % 5] }}
                          ></div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                            {cat.category}: {percentage}%
                          </span>
                        </div>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                          {formatCurrency(cat.spent)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Latest Orders Table */}
        <div className={`${isDarkMode ? 'bg-[#252930] border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Latest Orders</h3>
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
                  <th className="pb-3 font-medium">Seller</th>
                  <th className="pb-3 font-medium">Order Date</th>
                  <th className="pb-3 font-medium">Price</th>
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
                  .map((order, index) => {
                    // Get seller info from first item
                    const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
                    const seller = firstItem?.sellerId;
                    const sellerName = seller?.profile?.name || 
                                     (seller?.email ? seller.email.split('@')[0] : null) || 
                                     'Seller';
                    const sellerInitials = sellerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    
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
                              <span className="text-white text-xs font-medium">{sellerInitials}</span>
                            </div>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{sellerName}</span>
                          </div>
                        </td>
                        <td className={`py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                          {formatDate(order.createdAt || order.date)}
                        </td>
                        <td className={`py-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {formatCurrency(order.totalAmount)}
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
                             order.status === 'shipped' ? 'Delivered' : 
                             order.status === 'confirmed' ? 'Confirmed' :
                             order.status === 'pending' ? 'Pending' :
                             order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4">
                          <button 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                            onClick={() => handleLiveChat(order)}
                          >
                            <MessageCircle className="w-3 h-3" />
                            Live Chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAnalytics;