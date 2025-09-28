import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Award, Package, Phone, MessageCircle, Edit, Trash2, TrendingUp, Users, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import EditProductModal from '../../components/EditProductModal';
import MagicBento from '../../components/MagicBento.jsx';
import MagicCard from '../../components/MagicCard.jsx';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      // Try to fetch product from backend API first
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      let foundProduct = null;

      if (response.ok) {
        const data = await response.json();
        foundProduct = data.product;
        console.log('Fetched product from database:', foundProduct);
        
        // Transform backend data to match frontend expectations
        if (foundProduct) {
          foundProduct = {
            ...foundProduct,
            name: foundProduct.title,
            quantity: foundProduct.stock,
            categoryName: foundProduct.categoryId?.name || 'Unknown',
            unit: foundProduct.unit || 'kg',
            location: foundProduct.location || 'India',
            harvestDate: foundProduct.harvestDate || new Date().toLocaleDateString(),
            grade: foundProduct.grade || 'A+',
            rating: foundProduct.rating || 5,
            reviewsCount: foundProduct.reviewsCount || 0,
            agmarkCertified: foundProduct.agmarkCertified !== undefined ? foundProduct.agmarkCertified : true,
            images: foundProduct.images && foundProduct.images.length > 0 ? foundProduct.images : ['/placeholder.jpg']
          };
        }
      } else {
        console.log('Product not found in database, checking localStorage');
      }

      // If not found in database, check localStorage (user-added products)
      if (!foundProduct) {
        const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
        const userProduct = userProducts.find(product => product._id === id);
        
        if (userProduct) {
          foundProduct = {
            ...userProduct,
            name: userProduct.title || userProduct.name,
            harvestDate: userProduct.harvestDate || new Date().toLocaleDateString(),
            images: userProduct.images && userProduct.images.length > 0 
              ? userProduct.images 
              : [userProduct.imageUrl || '/placeholder.jpg'],
            agmarkCertified: userProduct.agmarkCertified ?? true,
            rating: userProduct.rating || 5,
            reviewsCount: userProduct.reviewsCount || Math.floor(Math.random() * 50) + 10
          };
        }
      }

      // If still not found, check mock products for demo
      if (!foundProduct) {
        const mockProducts = {
          '1': {
            _id: '1',
            name: 'Organic Wheat',
            title: 'Organic Wheat',
            price: 25,
            unit: 'kg',
            stock: 500,
            quantity: 500,
            location: 'Punjab, India',
            harvestDate: '27/9/2025',
            grade: 'A+',
            rating: 5,
            reviewsCount: 127,
            agmarkCertified: true,
            description: 'Premium quality organic wheat grown without pesticides using traditional farming methods.',
            images: [
              '/fresh-vegetables-tomatoes-carrots-onions.png',
              '/various-seeds-packets-wheat-rice-vegetable-seeds.png',
              '/organic-fertilizer-bags-compost-natural-farming.png',
              '/farmers-market-with-fresh-vegetables-and-fruits--p.png'
            ],
            categoryName: 'Grains & Cereals'
          },
          '2': {
            _id: '2',
            name: 'Basmati Rice',
            title: 'Basmati Rice',
            price: 45,
            unit: 'kg',
            stock: 1000,
            quantity: 1000,
            location: 'Punjab, India',
            harvestDate: '27/9/2025',
            grade: 'A+',
            rating: 5,
            reviewsCount: 89,
            agmarkCertified: true,
            description: 'Premium basmati rice with excellent aroma and long grains, perfect for biryanis and special dishes.',
            images: [
              '/various-seeds-packets-wheat-rice-vegetable-seeds.png',
              '/fresh-vegetables-tomatoes-carrots-onions.png',
              '/organic-fertilizer-bags-compost-natural-farming.png',
              '/farmers-market-with-fresh-vegetables-and-fruits--p.png'
            ],
            categoryName: 'Grains & Cereals'
          }
        };

        foundProduct = mockProducts[id];
      }

      if (foundProduct) {
        setProduct(foundProduct);
        
        setFarmer({
          name: 'Rajesh Kumar',
          rating: 4.8,
          reviews: 127,
          farmSize: '25 acres',
          experience: '15+ years',
          certification: ['Organic', 'AGMARK'],
          delivery: 'Available'
        });
      } else {
        setProduct(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setLoading(false);
    }
  };

  // Update quantity when product loads
  useEffect(() => {
    if (product) {
      setQuantity(product.stock || product.quantity || 100);
    }
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleEditProduct = () => {
    setEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    try {
      // Update in localStorage if it's a user-added product
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(p => p._id === updatedProduct._id);
      
      if (isUserProduct) {
        const updatedUserProducts = userProducts.map(p => 
          p._id === updatedProduct._id ? updatedProduct : p
        );
        localStorage.setItem('farmerProducts', JSON.stringify(updatedUserProducts));
        
        // Update current product state
        setProduct(updatedProduct);
        alert('Product updated successfully!');
      } else {
        alert('Cannot edit default products. Only user-added products can be edited.');
      }
      
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleRemoveProduct = () => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    
    try {
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(p => p._id === product._id);
      
      if (isUserProduct) {
        const filteredProducts = userProducts.filter(p => p._id !== product._id);
        localStorage.setItem('farmerProducts', JSON.stringify(filteredProducts));
        alert('Product removed successfully!');
        navigate('/farmer/dashboard');
      } else {
        alert('Cannot remove default products. Only user-added products can be removed.');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Error removing product');
    }
  };

  const handleUpdateStock = () => {
    try {
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(p => p._id === product._id);
      
      if (isUserProduct) {
        const updatedUserProducts = userProducts.map(p => 
          p._id === product._id 
            ? { ...p, stock: quantity, quantity: quantity }
            : p
        );
        localStorage.setItem('farmerProducts', JSON.stringify(updatedUserProducts));
        
        // Update current product state
        setProduct(prev => ({ ...prev, stock: quantity, quantity: quantity }));
        alert('Stock updated successfully!');
      } else {
        alert('Cannot update stock for default products. Only user-added products can be updated.');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate('/farmer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MagicBento className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 glow-pulse hover:shadow-green-400/25 border-green-200 text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <MagicCard className="space-y-4" glowIntensity="medium">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative">
              <ImageWithFallback
                src={product.images?.[0] || '/wheat-placeholder.jpg'}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {/* AGMARK Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-md glow-pulse">
                  AGMARK A+
                </span>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100">
                  Photo {index}
                </div>
              ))}
            </div>
          </MagicCard>

          {/* Product Info */}
          <div className="space-y-6">
            <MagicCard className="p-6" glowIntensity="medium">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">{product.title}</h1>
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Punjab, India</span>
                <Calendar className="h-4 w-4 ml-4 text-green-600" />
                <span>Harvested: {new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </MagicCard>

            {/* AGMARK Certification */}
            <MagicCard className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" glowIntensity="high">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full glow-pulse">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">AGMARK Certified</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm">
                      Grade A+
                    </span>
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 text-yellow-400 fill-current drop-shadow-sm" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">(5/5)</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Premium quality with exceptional standards</p>
                </div>
              </div>
            </MagicCard>

            {/* Pricing */}
            <MagicCard className="bg-gradient-to-br from-gray-50 to-green-50 p-4" glowIntensity="medium">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">₹{product.price}</span>
                <span className="text-lg text-gray-600">per kg</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{product.stock} kg available</p>
            </MagicCard>

            {/* Farmer Information */}
            <MagicCard className="p-4" glowIntensity="medium">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">Farmer Information</h3>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center glow-pulse">
                  <span className="text-xl font-bold text-green-700">R</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                  <p className="text-sm text-green-600">Certified Farmer</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current drop-shadow-sm" />
                    <span className="text-sm font-medium">{farmer.rating}</span>
                    <span className="text-sm text-gray-600">({farmer.reviews} reviews)</span>
                  </div>
                </div>
              </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-600">Farm Size:</span>
                <span className="font-medium ml-2">{farmer.farmSize}</span>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium ml-2">{farmer.experience}</span>
              </div>
              <div>
                <span className="text-gray-600">Certification:</span>
                <span className="font-medium ml-2">{farmer.certification.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Delivery:</span>
                <span className="font-medium ml-2 text-green-600">{farmer.delivery}</span>
              </div>
            </div>

              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 glow-pulse">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 glow-pulse">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </MagicCard>

            {/* Product Management */}
            <MagicCard className="p-4" glowIntensity="high">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-4">Manage Product</h3>
              <p className="text-sm text-gray-600 mb-4">Track your product performance and manage inventory</p>
            
              <div className="space-y-4">
                {/* Product Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg glow-pulse border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Views</p>
                        <p className="text-xl font-bold text-blue-800">1,247</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600 drop-shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-lg glow-pulse border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Inquiries</p>
                        <p className="text-xl font-bold text-green-800">23</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600 drop-shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Current Stock */}
                <div className="bg-gradient-to-br from-gray-50 to-green-50 p-4 rounded-lg border border-green-200 glow-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Current Stock:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">{product.stock || product.quantity} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price per kg:</span>
                    <span className="text-lg font-semibold text-green-600">₹{product.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Total Value:</span>
                    <span className="text-lg font-bold text-blue-600">₹{((product.stock || product.quantity) * product.price).toLocaleString()}</span>
                  </div>
                </div>

                {/* Management Actions */}
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-pulse shadow-lg hover:shadow-blue-400/25"
                    onClick={handleEditProduct}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product Details
                  </Button>
                  
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white glow-pulse shadow-lg hover:shadow-green-400/25">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Sales Analytics
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-red-600 text-red-600 hover:bg-red-50 glow-pulse hover:shadow-red-400/25"
                    onClick={handleRemoveProduct}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Product
                  </Button>
                </div>

                {/* Quick Update Stock */}
                <div className="pt-4 border-t border-green-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Stock (kg)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="flex-1 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter new stock quantity"
                    />
                    <Button 
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 glow-pulse shadow-lg hover:shadow-orange-400/25"
                      onClick={handleUpdateStock}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </MagicCard>
          </div>
        </div>

        {/* Edit Product Modal */}
        <EditProductModal
          product={product}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProduct}
        />
      </div>
    </MagicBento>
  );
};

export default ProductDetail;