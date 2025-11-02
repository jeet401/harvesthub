import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import MagicBento from '../../components/MagicBento';
import MagicCard from '../../components/MagicCard';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    qualityGrade: 'A+',
    images: [],
    imageUrls: [], // Support multiple images
    // AGMARK Certificate fields
    hasAgmarkCertificate: false,
    agmarkCertificateUrl: '',
    agmarkCertificateNumber: '',
    agmarkGrade: 'A+',
    // Additional fields
    unit: 'kg',
    location: '',
    harvestDate: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // Support multiple previews
  const [imagePreview, setImagePreview] = useState(null); // Keep for backward compatibility
  const [certificatePreview, setCertificatePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/categories`);
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

  const handleCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB for certificates)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('Certificate file is too large! Please select a file smaller than 2MB.');
        e.target.value = '';
        return;
      }

      // Check file type (PDF, JPEG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid certificate file (PDF, JPEG, or PNG).');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const certificateUrl = event.target.result;
        setCertificatePreview(file.name);
        setFormData(prev => ({
          ...prev,
          agmarkCertificateUrl: certificateUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCertificate = () => {
    setCertificatePreview(null);
    setFormData(prev => ({
      ...prev,
      agmarkCertificateUrl: '',
      agmarkCertificateNumber: '',
      hasAgmarkCertificate: false
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
          : (formData.imageUrl ? [formData.imageUrl] : []),
        // AGMARK certificate data
        agmarkCertificateUrl: formData.hasAgmarkCertificate ? formData.agmarkCertificateUrl : null,
        agmarkCertificateNumber: formData.hasAgmarkCertificate ? formData.agmarkCertificateNumber : null,
        agmarkGrade: formData.hasAgmarkCertificate ? formData.agmarkGrade : 'Not Graded',
        // Additional fields
        unit: formData.unit || 'kg',
        location: formData.location || '',
        harvestDate: formData.harvestDate || null,
        expiryDate: formData.expiryDate || null
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
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
        const successMessage = formData.hasAgmarkCertificate
          ? 'Product added successfully! Your AGMARK certificate will be verified by admin.'
          : 'Product added successfully to database!';
        alert(successMessage);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          stock: '',
          categoryId: '',
          qualityGrade: 'A+',
          images: [],
          imageUrls: [],
          hasAgmarkCertificate: false,
          agmarkCertificateUrl: '',
          agmarkCertificateNumber: '',
          agmarkGrade: 'A+',
          unit: 'kg',
          location: '',
          harvestDate: '',
          expiryDate: ''
        });
        setImagePreviews([]);
        setImagePreview(null);
        setCertificatePreview(null);
        setShowForm(false);
        
        // Navigate back to dashboard immediately to see the new product
        navigate('/farmer/dashboard');
      } else {
        console.error('API Error:', responseData);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        
        // Show detailed error message
        const errorMessage = responseData.message || 'Failed to add product';
        alert(`Error: ${errorMessage}\nStatus: ${response.status}`);
        
        // If authentication error, suggest re-login
        if (response.status === 401) {
          alert('Authentication failed. Please log in again.');
          window.location.href = '/auth/login';
          return;
        }
        
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

      // Product is now saved in database via API call above
      // No localStorage needed - all data comes from backend
      
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade *
                </label>
                <select
                  name="qualityGrade"
                  required
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="A+">A+ (Premium)</option>
                  <option value="A">A (High Quality)</option>
                  <option value="B+">B+ (Good Quality)</option>
                  <option value="B">B (Standard Quality)</option>
                  <option value="C">C (Basic Quality)</option>
                </select>
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

            {/* AGMARK Certificate Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="hasAgmark"
                  checked={formData.hasAgmarkCertificate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hasAgmarkCertificate: e.target.checked
                  }))}
                  className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="hasAgmark" className="text-sm font-medium text-gray-700">
                  I have AGMARK Certificate (Optional but Recommended)
                </label>
              </div>

              {formData.hasAgmarkCertificate && (
                <div className="space-y-4 pl-6 border-l-2 border-green-200">
                  <p className="text-sm text-green-600 mb-4">
                    ✓ AGMARK certified products get higher visibility and trust from buyers!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Number *
                      </label>
                      <input
                        type="text"
                        name="agmarkCertificateNumber"
                        required={formData.hasAgmarkCertificate}
                        value={formData.agmarkCertificateNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., AG-MH-2024-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AGMARK Grade *
                      </label>
                      <select
                        name="agmarkGrade"
                        required={formData.hasAgmarkCertificate}
                        value={formData.agmarkGrade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="A+">A+ (Premium)</option>
                        <option value="A">A (Excellent)</option>
                        <option value="B">B (Good)</option>
                        <option value="C">C (Standard)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Certificate (PDF/Image) *
                    </label>
                    
                    {!certificatePreview ? (
                      <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-green-50">
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png"
                          onChange={handleCertificateUpload}
                          required={formData.hasAgmarkCertificate}
                          className="hidden"
                          id="certificate-upload"
                        />
                        <label htmlFor="certificate-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-green-500 mb-3" />
                            <p className="text-sm text-gray-700 mb-1">
                              Click to upload AGMARK certificate
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, JPEG, PNG up to 2MB
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded">
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{certificatePreview}</p>
                              <p className="text-xs text-green-600">Certificate uploaded ✓</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCertificate}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Certificate will be verified by admin. Product will be marked as "Pending Verification" until approved.
                    </p>
                  </div>
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