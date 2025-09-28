import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Package, Check, Truck, MapPin, Phone, MessageCircle, Calendar, DollarSign } from 'lucide-react';

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/farmer', {
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
      buyer: 'Rajesh Kumar',
      quantity: 500,
      totalAmount: 12500,
      orderDate: '2025-01-18',
      expectedDelivery: '2025-01-15',
      status: 'shipped',
      progress: 75,
      trackingId: 'TRKORDER-001',
      location: 'Delhi, approaching destination',
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
      buyer: 'Priya Sharma',
      quantity: 300,
      totalAmount: 15000,
      orderDate: '2025-01-20',
      expectedDelivery: '2025-01-25',
      status: 'confirmed',
      progress: 50,
      trackingId: 'TRKORDER-002',
      location: 'Order confirmed, preparing for shipment',
      steps: [
        { name: 'Order Placed', completed: true, icon: Package },
        { name: 'Confirmed', completed: true, current: true, icon: Check },
        { name: 'Shipped', completed: false, icon: Truck },
        { name: 'Delivered', completed: false, icon: MapPin }
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
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = getOrdersByStatus(activeTab);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
        <p className="text-gray-600">Track your orders and communicate with farmers</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
          {[
            { key: 'active', label: 'Active', count: getOrdersByStatus('active').length },
            { key: 'completed', label: 'Completed', count: getOrdersByStatus('completed').length },
            { key: 'cancelled', label: 'Cancelled', count: getOrdersByStatus('cancelled').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} orders</h3>
          <p className="text-gray-600">Orders will appear here once customers start placing them</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{order.product}</h3>
                  <p className="text-sm text-gray-600">Order ID: {order.id} • From {order.buyer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{order.quantity} kg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Order Progress</span>
                  <span className="text-sm text-gray-600">{order.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-600 text-white' 
                          : step.current 
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`text-xs mt-2 text-center ${
                        step.completed || step.current ? 'font-medium' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Update */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Your order is on the way!</h4>
                    <p className="text-sm text-blue-700 mt-1">Tracking ID: {order.trackingId}</p>
                    <p className="text-sm text-blue-600 mt-1">📍 Last seen: {order.location}</p>
                  </div>
                </div>
              </div>

              {/* Farmer Info & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">{order.buyer.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.buyer}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">★ 4.8 (127 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;