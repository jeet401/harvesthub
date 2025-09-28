import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Save, X, Upload, Image as ImageIcon } from 'lucide-react';

const AddProduct = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    images: [],
    imageUrls: [] // Support multiple images
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // Support multiple previews
  const [imagePreview, setImagePreview] = useState(null); // Keep for backward compatibility

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        // Fallback to mock categories if API fails
        const mockCategories = [
          { _id: '1', name: 'Grains & Cereals' },
          { _id: '2', name: 'Vegetables' },
          { _id: '3', name: 'Fruits' },
          { _id: '4', name: 'Pulses & Legumes' },
          { _id: '5', name: 'Spices & Herbs' },
          { _id: '6', name: 'Seeds' },
          { _id: '7', name: 'Organic Products' },
          { _id: '8', name: 'Dairy Products' },
          { _id: '9', name: 'Nuts & Dry Fruits' },
          { _id: '10', name: 'Flowers' }
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock categories
      const mockCategories = [
        { _id: '1', name: 'Grains & Cereals' },
        { _id: '2', name: 'Vegetables' },
        { _id: '3', name: 'Fruits' },
        { _id: '4', name: 'Pulses & Legumes' },
        { _id: '5', name: 'Spices & Herbs' },
        { _id: '6', name: 'Seeds' },
        { _id: '7', name: 'Organic Products' },
        { _id: '8', name: 'Dairy Products' },
        { _id: '9', name: 'Nuts & Dry Fruits' },
        { _id: '10', name: 'Flowers' }
      ];
      setCategories(mockCategories);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image file is too large! Please select an image smaller than 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or GIF).');
        e.target.value = ''; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          imageUrl: imageUrl,
          images: [imageUrl]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      images: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.stock || !formData.categoryId) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data for backend API
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId || null,
        images: formData.imageUrls && formData.imageUrls.length > 0 
          ? formData.imageUrls 
          : (formData.imageUrl ? [formData.imageUrl] : [])
      };

      console.log('Submitting product data:', productData);

      // Check payload size before sending
      const payloadSize = new Blob([JSON.stringify(productData)]).size;
      console.log('Payload size:', payloadSize, 'bytes');
      
      if (payloadSize > 10 * 1024 * 1024) { // 10MB limit
        alert('Product data is too large. Please use smaller images.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(productData)
      });

      let responseData;
      
      // Check if response is JSON or HTML error page
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // If it's HTML error page (like 413 Payload Too Large), handle it
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        
        if (response.status === 413) {
          alert('Image file is too large for upload. Please use a smaller image (under 5MB).');
        } else {
          alert(`Server error (${response.status}): Please try again or use a smaller image.`);
        }
        
        // Fall back to localStorage
        console.log('Falling back to localStorage due to server error');
        handleLocalStorageFallback(productData);
        return;
      }

      console.log('Server response:', responseData);

      if (response.ok) {
        alert('Product added successfully to database!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          stock: '',
          categoryId: '',
          images: [],
          imageUrls: []
        });
        setImagePreviews([]);
        setImagePreview(null);
        setShowForm(false);
      } else {
        console.error('API Error:', responseData);
        alert(`Error: ${responseData.message || 'Failed to add product'}`);
        
        // If API fails, fallback to localStorage for demo purposes
        console.log('API failed, falling back to localStorage');
        handleLocalStorageFallback(productData);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Network error. Saving to local storage for demo.');
      
      // Fallback to localStorage if network fails
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        images: formData.imageUrl ? [formData.imageUrl] : []
      };
      handleLocalStorageFallback(productData);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function for localStorage (for demo when API is down)
  const handleLocalStorageFallback = (productData) => {
    try {
      const newProduct = {
        _id: Date.now().toString(),
        ...productData,
        name: productData.title,
        quantity: productData.stock,
        unit: 'kg',
        location: 'Punjab, India',
        harvestDate: new Date().toLocaleDateString(),
        grade: 'A+',
        rating: 5,
        reviewsCount: 0,
        categoryName: categories.find(cat => cat._id === productData.categoryId)?.name || 'Unknown',
        sellerId: 'farmer1',
        createdAt: new Date().toISOString(),
        agmarkCertified: Math.random() > 0.5
      };

      const existingProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const updatedProducts = [...existingProducts, newProduct];
      localStorage.setItem('farmerProducts', JSON.stringify(updatedProducts));

      alert('Product saved locally for demo!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        images: [],
        imageUrls: []
      });
      setImagePreviews([]);
      setImagePreview(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Failed to save product');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Products</h1>
        <p className="text-gray-600">Add and manage your crop listings</p>
      </div>

      {!showForm ? (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Product</h3>
            <p className="text-gray-600 mb-6">List your crops to reach potential buyers</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Organic Wheat"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per kg (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="25.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity (kg) *
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product quality, farming methods, certifications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload product image
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddProduct;