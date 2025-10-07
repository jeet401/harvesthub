import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Package, Check, Truck, MapPin, Phone, MessageCircle, Calendar, DollarSign, User } from 'lucide-react';
import MagicBento from '../../components/MagicBento';
import MagicCard from '../../components/MagicCard';

const Orders = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/buyer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(mockOrders); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockOrders = [
    {
      id: 'order-001',
      product: 'Organic Wheat',
      farmer: 'Rajesh Kumar',
      quantity: 500,
      totalAmount: 12500,
      orderDate: '2025-01-18',
      expectedDelivery: '2025-01-25',
      status: 'shipped',
      progress: 75,
      trackingId: 'TRKORDER-001',
      location: 'Delhi, approaching destination',
      farmerEmail: 'rajesh.farmer@example.com',
      farmerPhone: '+91 98765 43210',
      steps: [
        { name: 'Order Placed', completed: true, icon: Package },
        { name: 'Confirmed', completed: true, icon: Check },
        { name: 'Shipped', completed: true, current: true, icon: Truck },
        { name: 'Delivered', completed: false, icon: MapPin }
      ]
    },
    {
      id: 'order-002',
      product: 'Basmati Rice',
      farmer: 'Priya Sharma',
      quantity: 300,
      totalAmount: 15000,
      orderDate: '2025-01-20',
      expectedDelivery: '2025-01-27',
      status: 'confirmed',
      progress: 50,
      trackingId: 'TRKORDER-002',
      location: 'Order confirmed, preparing for shipment',
      farmerEmail: 'priya.farmer@example.com',
      farmerPhone: '+91 87654 32109',
      steps: [
        { name: 'Order Placed', completed: true, icon: Package },
        { name: 'Confirmed', completed: true, current: true, icon: Check },
        { name: 'Shipped', completed: false, icon: Truck },
        { name: 'Delivered', completed: false, icon: MapPin }
      ]
    },
    {
      id: 'order-003',
      product: 'Fresh Tomatoes',
      farmer: 'Suresh Kumar',
      quantity: 50,
      totalAmount: 2000,
      orderDate: '2025-01-15',
      expectedDelivery: '2025-01-22',
      status: 'delivered',
      progress: 100,
      trackingId: 'TRKORDER-003',
      location: 'Delivered successfully',
      farmerEmail: 'suresh.farmer@example.com',
      farmerPhone: '+91 76543 21098',
      steps: [
        { name: 'Order Placed', completed: true, icon: Package },
        { name: 'Confirmed', completed: true, icon: Check },
        { name: 'Shipped', completed: true, icon: Truck },
        { name: 'Delivered', completed: true, current: true, icon: MapPin }
      ]
    }
  ];

  const getOrdersByStatus = (status) => {
    switch (status) {
      case 'active':
        return orders.filter(order => ['confirmed', 'shipped'].includes(order.status));
      case 'completed':
        return orders.filter(order => order.status === 'delivered');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return `bg-blue-100 text-blue-800 ${isDarkMode ? 'dark:bg-blue-900/30 dark:text-blue-300' : ''}`;
      case 'shipped':
        return `bg-purple-100 text-purple-800 ${isDarkMode ? 'dark:bg-purple-900/30 dark:text-purple-300' : ''}`;
      case 'delivered':
        return `bg-green-100 text-green-800 ${isDarkMode ? 'dark:bg-green-900/30 dark:text-green-300' : ''}`;
      case 'cancelled':
        return `bg-red-100 text-red-800 ${isDarkMode ? 'dark:bg-red-900/30 dark:text-red-300' : ''}`;
      default:
        return `bg-gray-100 text-gray-800 ${isDarkMode ? 'dark:bg-gray-800 dark:text-gray-300' : ''}`;
    }
  };

  const filteredOrders = getOrdersByStatus(activeTab);

  if (loading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className={`text-lg bg-gradient-to-r ${isDarkMode 
              ? 'from-emerald-400 to-green-300' 
              : 'from-emerald-700 to-green-600'
            } bg-clip-text text-transparent`}>Loading your magical orders... ✨</div>
          </div>
        </div>
      </MagicBento>
    );
  }

  return (
    <MagicBento className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent mb-2`}>
            🛒 My Orders ✨
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your orders and communicate with farmers with magical precision</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <MagicCard className="p-1 max-w-md" glowIntensity="low">
            <div className="flex space-x-1">
              {[
                { key: 'active', label: 'Active', count: getOrdersByStatus('active').length },
                { key: 'completed', label: 'Completed', count: getOrdersByStatus('completed').length },
                { key: 'cancelled', label: 'Cancelled', count: getOrdersByStatus('cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : `${isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </MagicCard>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <MagicCard className="p-8 text-center" glowIntensity="low">
            <Package className={`h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No {activeTab} orders</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Orders will appear here once you start placing them</p>
          </MagicCard>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <MagicCard key={order.id} className="p-6" glowIntensity="medium">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.product}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order ID: {order.id} • From {order.farmer}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <Package className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quantity</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.quantity} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30' 
                      : 'bg-gradient-to-br from-green-100 to-emerald-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30' 
                      : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                    }`}>
                      <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order Date</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-purple-900/30 to-violet-900/30' 
                      : 'bg-gradient-to-br from-purple-100 to-violet-100'
                    }`}>
                      <Truck className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expected Delivery</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Order Progress ✨</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{order.progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-sm glow-pulse" 
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                  {order.steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.name} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          step.completed 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white glow-pulse' 
                            : step.current 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          step.completed || step.current 
                            ? `font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}` 
                            : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                        }`}>
                          {step.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status Update */}
                <div className={`rounded-xl p-4 mb-4 shadow-sm border-2 ${isDarkMode 
                  ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-700/50' 
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full shadow-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-blue-800/50 to-cyan-800/50' 
                      : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                    }`}>
                      <Truck className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Your order is on the way! 🚚</h4>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Tracking ID: {order.trackingId}</p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>📍 Last seen: {order.location}</p>
                    </div>
                  </div>
                </div>

                {/* Farmer Info & Actions */}
                <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${isDarkMode 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                      : 'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      <span className="text-sm font-bold text-white">{order.farmer.charAt(0)}</span>
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.farmer}</p>
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>⭐ 4.8 (127 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="shadow-sm hover:shadow-lg transition-all duration-300">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-sm hover:shadow-lg transition-all duration-300">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        )}
      </div>
    </MagicBento>
  );
};

export default Orders;