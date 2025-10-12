import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { Package, Eye, Clock, CheckCircle, XCircle, Truck, MapPin, MessageCircle, DollarSign, Calendar, Receipt, X, CheckCircle2 } from 'lucide-react';
import MagicBento from '../../components/MagicBento';
import MagicCard from '../../components/MagicCard';

const Orders = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(null); // Track which order's breakdown to show
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'delivered'
  const [receivingOrder, setReceivingOrder] = useState(null); // Track which order is being marked as received

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders...');
      const response = await api.getOrders();
      console.log('Orders response:', response);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50';
      case 'pending':
        return isDarkMode ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-50';
      case 'processing':
        return isDarkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50';
      case 'shipped':
        return isDarkMode ? 'text-indigo-400 bg-indigo-900/30' : 'text-indigo-600 bg-indigo-50';
      case 'delivered':
        return isDarkMode ? 'text-green-500 bg-green-900/30' : 'text-green-700 bg-green-100';
      case 'cancelled':
        return isDarkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50';
      default:
        return isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressByStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 10;
      case 'confirmed':
      case 'paid':
        return 25;
      case 'processing':
        return 50;
      case 'shipped':
        return 75;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 25;
    }
  };

  const handleMarkAsReceived = async (orderId) => {
    try {
      setReceivingOrder(orderId);
      console.log('Marking order as received:', orderId);
      
      await api.markOrderAsReceived(orderId);
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'delivered', progress: 100, actualDelivery: new Date() }
            : order
        )
      );
      
      console.log('Order marked as received successfully');
    } catch (error) {
      console.error('Error marking order as received:', error);
      setError('Failed to mark order as received');
    } finally {
      setReceivingOrder(null);
    }
  };

  // Filter orders based on delivery status
  const pendingOrders = orders.filter(order => 
    !['delivered'].includes(order.status?.toLowerCase())
  );
  
  const deliveredOrders = orders.filter(order => 
    order.status?.toLowerCase() === 'delivered'
  );

  if (loading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
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
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            My Orders 📦
          </h1>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Track your purchases and delivery status
          </p>
          
          {/* Tabs for Order Status */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? isDarkMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              To be Delivered ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'delivered'
                  ? isDarkMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Delivered ({deliveredOrders.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {(activeTab === 'pending' ? pendingOrders : deliveredOrders).length === 0 ? (
          <MagicCard className={`text-center py-12 ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <Package className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-300'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {activeTab === 'pending' ? 'No Pending Orders' : 'No Delivered Orders'}
            </h3>
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {activeTab === 'pending' 
                ? "You don't have any orders to be delivered. Start shopping to see your orders here."
                : "You don't have any delivered orders yet. Complete some orders to see them here."
              }
            </p>
            <Link 
              to="/buyer/products"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </MagicCard>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'pending' ? pendingOrders : deliveredOrders).map((order) => (
              <MagicCard
                key={order._id}
                className={`overflow-hidden transition-all hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Header with Product Name and Status */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {order.items?.[0]?.productId?.title || order.items?.[0]?.productId?.name || 'Order'} 
                        {order.items?.length > 1 && ` + ${order.items.length - 1} more`}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Order ID: {order._id?.slice(-8)?.toUpperCase() || 'N/A'} • From {order.items?.[0]?.sellerId?.name || 'Farmer'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1) || 'Confirmed'}
                    </span>
                  </div>

                  {/* Order Progress and Metrics */}
                  <div className="flex justify-between items-center gap-6 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
                      }`}>
                        <Package className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Quantity
                        </p>
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
                      }`}>
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Total Amount
                        </p>
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          ₹{order.totalAmount || order.total || order.amount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
                      }`}>
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Order Date
                        </p>
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatDate(order.createdAt).split(',')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
                      }`}>
                        <Truck className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Expected Delivery
                        </p>
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '7-10 days'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Order Progress 🚀
                      </span>
                      <span className={`text-sm font-bold ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {order.progress || getProgressByStatus(order.status)}%
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${order.progress || getProgressByStatus(order.status)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className={`flex items-center text-xs ${
                        (order.progress || getProgressByStatus(order.status)) >= 25 ? 'text-emerald-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          (order.progress || getProgressByStatus(order.status)) >= 25 ? 'bg-emerald-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        Order Placed
                      </div>
                      <div className={`flex items-center text-xs ${
                        (order.progress || getProgressByStatus(order.status)) >= 50 ? 'text-emerald-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          (order.progress || getProgressByStatus(order.status)) >= 50 ? 'bg-emerald-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        Confirmed
                      </div>
                      <div className={`flex items-center text-xs ${
                        (order.progress || getProgressByStatus(order.status)) >= 75 ? 'text-emerald-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          (order.progress || getProgressByStatus(order.status)) >= 75 ? 'bg-emerald-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        Shipped
                      </div>
                      <div className={`flex items-center text-xs ${
                        (order.progress || getProgressByStatus(order.status)) >= 100 ? 'text-emerald-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          (order.progress || getProgressByStatus(order.status)) >= 100 ? 'bg-emerald-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        Delivered
                      </div>
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {order.trackingId && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <Truck className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Your order is on the way! 🚛</span>
                      </div>
                      <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                        Tracking ID: {order.trackingId}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        📍 Last seen: Delhi, approaching destination
                      </p>
                    </div>
                  )}

                  {/* Farmer Information */}
                  {order.items?.[0]?.sellerId && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {order.items[0].sellerId.name?.charAt(0)?.toUpperCase() || 'F'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {order.items[0].sellerId.name || order.items[0].sellerId.email || 'Unknown Farmer'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowBreakdown(showBreakdown === order._id ? null : order._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                          title="Cost Breakdown"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        
                        {/* Mark as Received Button - Only show for shipped orders */}
                        {(order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'confirmed' || order.status?.toLowerCase() === 'paid') && activeTab === 'pending' && (
                          <button
                            onClick={() => handleMarkAsReceived(order._id)}
                            disabled={receivingOrder === order._id}
                            className={`p-2 rounded-lg transition-colors ${
                              receivingOrder === order._id
                                ? isDarkMode 
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isDarkMode 
                                  ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title="Mark as Received"
                          >
                            {receivingOrder === order._id ? (
                              <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <Link
                          to={`/chat?orderId=${order._id}&sellerId=${order.items[0].sellerId._id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          title="Chat with Farmer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/buyer/order-success?orderId=${order._id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 text-white hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  {showBreakdown === order._id && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700/30 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-semibold flex items-center ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          <Receipt className="w-4 h-4 mr-2" />
                          Cost Breakdown
                        </h4>
                        <button
                          onClick={() => setShowBreakdown(null)}
                          className={`p-1 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-gray-600 text-gray-400' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Item Breakdown */}
                        <div className="space-y-1">
                          {order.items?.map((item, index) => (
                            <div key={index} className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <span>
                                {item.productId?.title || item.productId?.name} × {item.quantity}
                              </span>
                              <span>₹{(item.priceAtPurchase || item.productId?.price || 0) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <hr className={`my-2 ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`} />
                        
                        {/* Cost Summary */}
                        <div className={`space-y-1 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{order.subtotal || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>₹{order.shippingCharges || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes (5%):</span>
                            <span>₹{order.taxes || 0}</span>
                          </div>
                        </div>
                        
                        <hr className={`my-2 ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        }`} />
                        
                        <div className={`flex justify-between font-semibold ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          <span>Total Amount:</span>
                          <span>₹{order.totalAmount || order.total || order.amount || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </MagicCard>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Link 
            to="/buyer/products"
            className={`inline-block px-6 py-3 rounded-lg transition-colors font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </MagicBento>
  );
};

export default Orders;