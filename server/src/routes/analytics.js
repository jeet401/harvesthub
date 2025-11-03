const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { authRequired } = require('../middleware/auth');

// Farmer Analytics Dashboard
router.get('/farmer', authRequired, async (req, res) => {
  try {
    const farmerId = req.user.sub;
    
    // Get all orders for farmer's products
    const orders = await Order.find({ 'items.sellerId': farmerId })
      .populate('userId', 'email')
      .populate('items.productId', 'title price category')
      .sort({ createdAt: -1 });

    // Filter orders to only include farmer's items
    const farmerOrders = orders.map(order => {
      const farmerItems = order.items.filter(item => 
        item.sellerId.toString() === farmerId
      );
      return {
        ...order.toObject(),
        items: farmerItems,
        farmerRevenue: farmerItems.reduce((sum, item) => sum + item.totalPrice, 0)
      };
    }).filter(order => order.items.length > 0);

    // Get farmer's products
    const products = await Product.find({ sellerId: farmerId })
      .populate('categoryId', 'name');

    // Calculate metrics
    const totalRevenue = farmerOrders.reduce((sum, order) => sum + order.farmerRevenue, 0);
    const totalOrders = farmerOrders.length;
    const totalProducts = products.length;
    const totalCustomers = [...new Set(farmerOrders.map(order => order.userId._id.toString()))].length;

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = farmerOrders.filter(order => 
        new Date(order.createdAt) >= monthStart && new Date(order.createdAt) <= monthEnd
      );
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthOrders.reduce((sum, order) => sum + order.farmerRevenue, 0),
        orders: monthOrders.length
      };
    }).reverse();

    // Product performance
    const productPerformance = products.map(product => {
      const productOrders = farmerOrders.flatMap(order => 
        order.items.filter(item => item.productId._id.toString() === product._id.toString())
      );
      
      const totalSold = productOrders.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = productOrders.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        _id: product._id,
        title: product.title,
        category: product.categoryId?.name || 'Uncategorized',
        price: product.price,
        stock: product.stock,
        totalSold,
        revenue,
        orders: productOrders.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Order status distribution
    const statusDistribution = farmerOrders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Category performance
    const categoryPerformance = productPerformance.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = { category, revenue: 0, orders: 0, products: 0 };
      }
      acc[category].revenue += product.revenue;
      acc[category].orders += product.orders;
      acc[category].products += 1;
      return acc;
    }, {});

    // Recent orders (last 10)
    const recentOrders = farmerOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Growth metrics (comparing this month vs last month)
    const thisMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);

    const thisMonthOrders = farmerOrders.filter(order => 
      new Date(order.createdAt) >= thisMonthStart
    );
    const lastMonthOrders = farmerOrders.filter(order => 
      new Date(order.createdAt) >= lastMonthStart && new Date(order.createdAt) <= lastMonthEnd
    );

    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.farmerRevenue, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.farmerRevenue, 0);

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    const orderGrowth = lastMonthOrders.length > 0
      ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100).toFixed(1)
      : 0;

    return res.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth: parseFloat(revenueGrowth),
        orderGrowth: parseFloat(orderGrowth)
      },
      charts: {
        monthlyRevenue,
        productPerformance: productPerformance.slice(0, 10), // Top 10 products
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          status
        })),
        categoryPerformance: Object.values(categoryPerformance)
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        customerEmail: order.userId?.email || 'Unknown',
        items: order.items.length,
        revenue: order.farmerRevenue,
        status: order.status,
        date: order.createdAt
      }))
    });

  } catch (error) {
    console.error('Farmer analytics error:', error);
    return res.status(500).json({ message: 'Failed to fetch farmer analytics' });
  }
});

// Buyer Analytics Dashboard
router.get('/buyer', authRequired, async (req, res) => {
  try {
    const buyerId = req.user.sub;
    const { dateRange = '12months', category } = req.query;
    
    console.log('Fetching buyer analytics for:', buyerId, 'dateRange:', dateRange);
    
    // Build date filter based on dateRange
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case '1month':
        dateFilter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case '3months':
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        dateFilter.createdAt = { $gte: threeMonthsAgo };
        break;
      case '6months':
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        dateFilter.createdAt = { $gte: sixMonthsAgo };
        break;
      case '12months':
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
        dateFilter.createdAt = { $gte: twelveMonthsAgo };
        break;
      case 'all':
      default:
        // No date filter for 'all'
        break;
    }
    
    // Build query with filters
    let orderQuery = { userId: buyerId, ...dateFilter };
    
    // Get all buyer's orders with filters
    const orders = await Order.find(orderQuery)
      .populate({
        path: 'items.productId',
        select: 'title price categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .populate('items.sellerId', 'email role')
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for buyer ${buyerId}`);

    // Get seller profiles separately
    const sellerIds = [...new Set(orders.flatMap(order => 
      order.items.map(item => item.sellerId?._id).filter(Boolean)
    ))];

    const profiles = await Profile.find({ userId: { $in: sellerIds } });

    // Apply category filter if specified
    let filteredOrders = orders;
    if (category && category !== 'all') {
      filteredOrders = orders.filter(order => 
        order.items.some(item => {
          const itemCategory = item.productId?.categoryId?.name?.toLowerCase() || '';
          return itemCategory.includes(category.toLowerCase());
        })
      );
    }

    // Calculate metrics
    const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
    );
    const uniqueSellers = [...new Set(filteredOrders.flatMap(order => 
      order.items.map(item => item.sellerId?._id?.toString()).filter(Boolean)
    ))].length;

    // Monthly spending (last 6 months)
    const monthlySpending = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = filteredOrders.filter(order => 
        new Date(order.createdAt) >= monthStart && new Date(order.createdAt) <= monthEnd
      );
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        spent: monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        orders: monthOrders.length,
        purchases: monthOrders.length // Add purchases count for the chart
      };
    }).reverse();

    // Category spending
    const categorySpending = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.productId?.categoryId?.name || item.productId?.category || 'Uncategorized';
        if (!categorySpending[category]) {
          categorySpending[category] = { category, spent: 0, items: 0 };
        }
        categorySpending[category].spent += item.totalPrice || 0;
        categorySpending[category].items += item.quantity || 0;
      });
    });

    // Order status distribution
    const statusDistribution = filteredOrders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Favorite products (most ordered)
    const productFrequency = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        // Skip items with null/undefined products
        if (!item.productId || !item.productId._id) return;
        
        const productId = item.productId._id.toString();
        if (!productFrequency[productId]) {
          productFrequency[productId] = {
            product: item.productId,
            quantity: 0,
            orders: 0,
            totalSpent: 0
          };
        }
        productFrequency[productId].quantity += item.quantity || 0;
        productFrequency[productId].orders += 1;
        productFrequency[productId].totalSpent += item.totalPrice || 0;
      });
    });

    const favoriteProducts = Object.values(productFrequency)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Recent orders (last 10) with seller info  
    const recentOrders = orders.slice(0, 10).map(order => {
      // Enrich order items with seller profile data
      const enrichedItems = order.items.map(item => {
        // Handle missing seller data
        if (!item.sellerId || !item.sellerId._id) {
          return {
            productId: item.productId,
            sellerId: null,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice
          };
        }

        const sellerProfile = profiles.find(p => 
          p.userId && item.sellerId && p.userId.toString() === item.sellerId._id.toString()
        );
        
        return {
          productId: item.productId,
          sellerId: {
            _id: item.sellerId._id,
            email: item.sellerId.email,
            role: item.sellerId.role,
            profile: sellerProfile ? {
              name: sellerProfile.name || item.sellerId.email?.split('@')[0] || 'Seller',
              phone: sellerProfile.phone,
              address: sellerProfile.address
            } : {
              name: item.sellerId.email?.split('@')[0] || 'Seller',
              phone: null,
              address: null
            }
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice
        };
      });

      return {
        _id: order._id,
        userId: order.userId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: enrichedItems
      };
    });

    // Growth metrics
    const thisMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);

    const thisMonthOrders = orders.filter(order => 
      new Date(order.createdAt) >= thisMonthStart
    );
    const lastMonthOrders = orders.filter(order => 
      new Date(order.createdAt) >= lastMonthStart && new Date(order.createdAt) <= lastMonthEnd
    );

    const thisMonthSpent = thisMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const lastMonthSpent = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const spendingGrowth = lastMonthSpent > 0 
      ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent * 100).toFixed(1)
      : 0;

    return res.json({
      summary: {
        totalSpent,
        totalOrders,
        totalItems,
        uniqueSellers,
        averageOrderValue: totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0,
        spendingGrowth: parseFloat(spendingGrowth)
      },
      charts: {
        monthlySpending,
        categorySpending: Object.values(categorySpending)
          .sort((a, b) => b.spent - a.spent),
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          status
        })),
        favoriteProducts
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        date: order.createdAt
      }))
    });

  } catch (error) {
    console.error('Buyer analytics error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Failed to fetch buyer analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;