import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Package, Truck, MapPin, Phone, MessageCircle, DollarSign, User, Clock, CheckCircle, XCircle, Eye, Receipt, X } from 'lucide-react';
import MagicBento from '../../components/MagicBento';
import MagicCard from '../../components/MagicCard';
import { api } from '../../lib/api';

const OrderTracking = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(null);
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'completed'
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching farmer orders for user:', user?.sub || 'No user ID');
      
      const data = await api.getFarmerOrders();
      console.log('Farmer orders response:', data);
      console.log('Number of orders received:', data?.orders?.length || 0);
      
      if (data?.orders?.length === 0) {
        console.log('No orders found for farmer. This could mean:');
        console.log('1. No products have been ordered yet');
        console.log('2. User ID mismatch between buyer orders and farmer products');
        console.log('3. Database connection issues');
      }
      
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching farmer orders:', error);
      console.error('Error details:', error.message);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on completion status
  const ongoingOrders = orders.filter(order => 
    !['delivered', 'cancelled', 'refunded'].includes(order.status?.toLowerCase())
  );
  
  const completedOrders = orders.filter(order => 
    ['delivered', 'cancelled', 'refunded'].includes(order.status?.toLowerCase())
  );

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      console.log('Updating order status:', { orderId, newStatus, user });
      
      const result = await api.updateOrderStatus(orderId, { status: newStatus });
      console.log('Order status updated successfully:', result);
      
      // Update local state immediately for better UX
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', error.message);
      setError(`Failed to update order status: ${error.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

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
            Order Management �
          </h1>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Track and manage orders for your products
          </p>
          
          {/* Tabs for Order Status */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'ongoing'
                  ? isDarkMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ongoing Orders ({ongoingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'completed'
                  ? isDarkMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {(activeTab === 'ongoing' ? ongoingOrders : completedOrders).length === 0 ? (
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
              {activeTab === 'ongoing' ? 'No Ongoing Orders' : 'No Completed Orders'}
            </h3>
            <p className={`mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {activeTab === 'ongoing' 
                ? "You don't have any ongoing orders. New orders will appear here when customers purchase your products."
                : "You don't have any completed orders yet. Delivered and cancelled orders will appear here."
              }
            </p>
          </MagicCard>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'ongoing' ? ongoingOrders : completedOrders).map((order) => (
              <MagicCard
                key={order._id}
                className={`p-6 transition-all hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 lg:mb-0">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Order #{order._id?.slice(-8) || 'N/A'}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Received on {formatDate(order.createdAt)}
                      </p>
                      <div className="flex items-center mt-1">
                        <User className={`w-4 h-4 mr-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Buyer: {typeof order.buyer === 'string' ? order.buyer : order.buyer?.email || order.userId?.email || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'Confirmed'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className={`font-medium text-sm mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Products ({order.items?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <img 
                          src={item.productId?.imageUrl || item.productId?.images?.[0] || '/placeholder.jpg'} 
                          alt={item.productId?.title || item.productId?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.productId?.title || item.productId?.name || 'Product'}
                          </p>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Ordered: {item.quantity} units
                          </p>
                          <p className={`text-xs font-medium ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`}>
                            Earn: ₹{(item.priceAtPurchase || item.productId?.price || 0) * item.quantity}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No items information available
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Earnings:
                      </span>
                      <span className={`ml-2 font-bold text-xl ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        ₹{order.totalAmount || order.total || order.amount || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <button
                      onClick={() => setShowBreakdown(showBreakdown === order._id ? null : order._id)}
                      className={`inline-flex items-center text-sm px-3 py-1 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Receipt className="w-4 h-4 mr-1" />
                      Cost Breakdown
                    </button>
                    {(order.status?.toLowerCase() === 'pending') && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        disabled={updatingOrder === order._id}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? 'Confirming...' : 'Confirm Order'}
                      </Button>
                    )}
                    {(order.status?.toLowerCase() === 'confirmed' || order.status?.toLowerCase() === 'paid') && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                        disabled={updatingOrder === order._id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? 'Shipping...' : 'Mark as Shipped'}
                      </Button>
                    )}
                    {order.status?.toLowerCase() === 'shipped' && (
                      <Button
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        disabled={updatingOrder === order._id}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? 'Delivering...' : 'Mark as Delivered'}
                      </Button>
                    )}
                    {order.userId && (
                      <Link
                        to={`/chat?orderId=${order._id}&buyerId=${order.userId._id || order.userId}`}
                        className={`inline-flex items-center text-sm px-3 py-1 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat with Buyer
                      </Link>
                    )}
                  </div>
                </div>

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
                        Earnings Breakdown
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
                      {/* Your Products Breakdown */}
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <div key={index} className={`flex justify-between text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span>
                              {item.productId?.title || item.productId?.name} × {item.quantity}
                            </span>
                            <span className={`font-medium ${
                              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            }`}>
                              ₹{(item.priceAtPurchase || item.productId?.price || 0) * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <hr className={`my-2 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                      }`} />
                      
                      {/* Order Details */}
                      <div className={`space-y-1 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex justify-between">
                          <span>Buyer:</span>
                          <span>{typeof order.buyer === 'string' ? order.buyer : order.buyer?.email || order.userId?.email || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order Date:</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <hr className={`my-2 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-300'
                      }`} />
                      
                      <div className={`flex justify-between font-semibold text-lg ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        <span>Total Earnings:</span>
                        <span>₹{order.totalAmount || order.total || order.amount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}>
                    <h5 className={`text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Delivery Address:
                    </h5>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div>{order.deliveryAddress.fullName}</div>
                      <div>{order.deliveryAddress.addressLine1}</div>
                      {order.deliveryAddress.addressLine2 && <div>{order.deliveryAddress.addressLine2}</div>}
                      <div>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
                      <div className="flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {order.deliveryAddress.phoneNumber}
                      </div>
                    </div>
                  </div>
                )}
              </MagicCard>
            ))}
          </div>
        )}
      </div>
    </MagicBento>
  );
};

export default OrderTracking;