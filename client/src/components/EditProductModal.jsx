import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const EditProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'Kilograms',
    price: '',
    harvestDate: '',
    agmarkGrade: 'A+ (Premium)',
    description: '',
    photoUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || product.title || '',
        quantity: product.stock || product.quantity || '',
        unit: product.unit || 'Kilograms',
        price: product.price || '',
        harvestDate: product.harvestDate || '',
        agmarkGrade: product.grade === 'A+' ? 'A+ (Premium)' : product.grade || 'A+ (Premium)',
        description: product.description || '',
        photoUrl: product.imageUrl || ''
      });
      setImagePreview(product.imageUrl || null);
    }
  }, [product, isOpen]);

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
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          photoUrl: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedProduct = {
      ...product,
      title: formData.name,
      name: formData.name,
      stock: parseInt(formData.quantity),
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      harvestDate: formData.harvestDate,
      grade: formData.agmarkGrade.includes('A+') ? 'A+' : formData.agmarkGrade,
      description: formData.description,
      imageUrl: formData.photoUrl,
      images: formData.photoUrl ? [formData.photoUrl] : product.images,
      unit: formData.unit
    };

    // Try to save to backend database first
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: updatedProduct.title,
          description: updatedProduct.description,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          unit: updatedProduct.unit,
          grade: updatedProduct.grade,
          harvestDate: updatedProduct.harvestDate,
          images: updatedProduct.images
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Product updated in database:', data);
        // Transform backend response to match frontend expectations
        const savedProduct = {
          ...data.product,
          name: data.product.title,
          quantity: data.product.stock
        };
        onSave(savedProduct);
        return;
      } else {
        console.log('Database update failed, saving to localStorage fallback');
      }
    } catch (error) {
      console.error('Error updating product in database:', error);
      console.log('Using localStorage fallback');
    }

    // Fallback: Save to localStorage (for user-added products or when API fails)
    try {
      const userProducts = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
      const isUserProduct = userProducts.find(p => p._id === product._id);
      
      if (isUserProduct) {
        const updatedUserProducts = userProducts.map(p => 
          p._id === product._id ? updatedProduct : p
        );
        localStorage.setItem('farmerProducts', JSON.stringify(updatedUserProducts));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    onSave(updatedProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="relative w-full max-w-2xl bg-white">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Crop</h2>
                <p className="text-sm text-gray-600">Update your crop listing details</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Crop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Kilograms">Kilograms</option>
                    <option value="Tons">Tons</option>
                    <option value="Quintals">Quintals</option>
                    <option value="Pieces">Pieces</option>
                  </select>
                </div>
              </div>

              {/* Price and Harvest Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per kg
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harvest Date
                  </label>
                  <input
                    type="text"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* AGMARK Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AGMARK Grade
                </label>
                <select
                  name="agmarkGrade"
                  value={formData.agmarkGrade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="A+ (Premium)">A+ (Premium)</option>
                  <option value="A (Good)">A (Good)</option>
                  <option value="B (Fair)">B (Fair)</option>
                  <option value="C (Below Average)">C (Below Average)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL (optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  
                  {/* Or Upload Image */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Or upload an image:</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                      <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </div>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Crop
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProductModal;