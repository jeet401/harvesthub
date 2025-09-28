import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2, Eye, Package, DollarSign, Star, TrendingUp } from 'lucide-react';
import EditProductModal from '../../components/EditProductModal';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalQuantity: 0,
    potentialRevenue: 0,
    avgGrade: 'A+'
  });
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      // Try to fetch from backend API first
      const response = await fetch('http://localhost:5000/api/products?seller=current', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      let products = [];
      
      if (response.ok) {
        const data = await response.json();
        products = data.products || [];
        console.log('Fetched products from database:', products);
      } else {
        console.log('API failed, using fallback data');
        // Fallback to mock products if API fails
        products = [];
      }

      // Also include localStorage products for demo purposes
      const localProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      
      // Only show mock products if no real products exist and no local products (for first-time demo)
      const mockProducts = (products.length === 0 && localProducts.length === 0) ? [] : [];

      // Combine all products: database + localStorage (no mock products for new farmers)
      const allProducts = [
        ...products.map(p => ({
          ...p,
          name: p.title,
          quantity: p.stock,
          categoryName: p.categoryId?.name || 'Unknown',
        })),
        ...localProducts
      ];
      
      setCrops(allProducts);
      calculateStats(allProducts);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      
      // Fallback to localStorage only (no mock data for new farmers)
      const localProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');

      const allProducts = [...localProducts];
      setCrops(allProducts);
      calculateStats(allProducts);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products) => {
    const totalCrops = products.length;
    const totalQuantity = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const potentialRevenue = products.reduce((sum, product) => sum + (product.price * (product.stock || 0)), 0);
    
    setStats({
      totalCrops,
      totalQuantity,
      potentialRevenue,
      avgGrade: 'A+' // This would come from your grading system
    });
  };

  const handleDeleteCrop = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      // Check if it's a localStorage product (user-added)
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(product => product._id === cropId);
      
      if (isUserProduct) {
        // Remove from localStorage
        const filteredProducts = userProducts.filter(product => product._id !== cropId);
        localStorage.setItem('farmerProducts', JSON.stringify(filteredProducts));
        fetchFarmerData(); // Refresh the list
        alert('Product deleted successfully!');
      } else {
        // For mock products, just show alert (they can't be actually deleted)
        alert('Cannot delete default products. Only user-added products can be deleted.');
      }

      // Uncomment this when backend is ready:
      /*
      const response = await fetch(`/api/products/${cropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchFarmerData();
        alert('Product deleted successfully!');
      }
      */
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleEditCrop = (crop) => {
    setSelectedProduct(crop);
    setEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    try {
      // Update in localStorage if it's a user-added product
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(product => product._id === updatedProduct._id);
      
      if (isUserProduct) {
        const updatedUserProducts = userProducts.map(product => 
          product._id === updatedProduct._id ? updatedProduct : product
        );
        localStorage.setItem('farmerProducts', JSON.stringify(updatedUserProducts));
      }
      
      // Refresh the data
      fetchFarmerData();
      setEditModalOpen(false);
      setSelectedProduct(null);
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Farmer'}!
        </h1>
        <p className="text-gray-600">Manage your crop listings and track your sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCrops}</p>
              <p className="text-xs text-gray-500 mt-1">Active listings</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">kg available</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Potential Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.potentialRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Expected earnings</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. AGMARK Grade</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}</p>
              <p className="text-xs text-gray-500 mt-1">Quality rating</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/farmer/products/add')}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Product</p>
                <p className="text-sm text-gray-600">List a new crop for sale</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/farmer/orders')}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-600">Track your sales and deliveries</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Edit className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your farm details</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Crop Listings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Crop Listings</h2>
            <p className="text-sm text-gray-600">Manage and track all your crop listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50" 
              onClick={() => navigate('/farmer/orders')}
            >
              <Package className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/farmer/products/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Crop
            </Button>
          </div>
        </div>

        {crops.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crops listed yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first crop listing</p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/farmer/products/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Crop
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 font-medium text-gray-700">Crop</th>
                  <th className="text-left pb-3 font-medium text-gray-700">Quantity</th>
                  <th className="text-left pb-3 font-medium text-gray-700">Price</th>
                  <th className="text-left pb-3 font-medium text-gray-700">Grade</th>
                  <th className="text-left pb-3 font-medium text-gray-700">Harvest Date</th>
                  <th className="text-left pb-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop, index) => (
                  <tr key={crop._id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{crop.title}</p>
                          <p className="text-sm text-gray-500">
                            {crop.categoryName || 'Uncategorized'} • {crop.location || 'Punjab, India'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900">{crop.stock} kg</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900">₹{crop.price}/kg</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          A+
                        </span>
                        <div className="flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">(5/5)</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900">
                        {new Date().toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/farmer/products/${crop._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCrop(crop)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCrop(crop._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Product Modal */}
      <EditProductModal
        product={selectedProduct}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default FarmerDashboard;