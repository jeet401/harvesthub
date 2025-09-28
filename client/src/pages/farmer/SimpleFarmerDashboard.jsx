import React from 'react';

const SimpleFarmerDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, Farmer!
        </h1>
        <p className="text-gray-600">Manage your crop listings and track your sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-gray-500 mt-1">Active listings</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              📦
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">1,500</p>
              <p className="text-xs text-gray-500 mt-1">kg available</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              📈
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Potential Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹57,500</p>
              <p className="text-xs text-gray-500 mt-1">Expected earnings</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              💰
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. AGMARK Grade</p>
              <p className="text-2xl font-bold text-gray-900">A+</p>
              <p className="text-xs text-gray-500 mt-1">Quality rating</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              ⭐
            </div>
          </div>
        </div>
      </div>

      {/* Crop Listings */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Crop Listings</h2>
            <p className="text-sm text-gray-600">Manage and track all your crop listings</p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            ➕ Add New Crop
          </button>
        </div>

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
              <tr className="border-b border-gray-100">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      🌾
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Organic Wheat</p>
                      <p className="text-sm text-gray-500">Punjab, India</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">500 kg</span>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">₹25/kg</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      A+
                    </span>
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="text-xs text-gray-500">(5/5)</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">15/01/2025</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-600 hover:text-gray-900">👁️</button>
                    <button className="p-1 text-gray-600 hover:text-gray-900">✏️</button>
                    <button className="p-1 text-red-600 hover:text-red-700">🗑️</button>
                  </div>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      🍚
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Basmati Rice</p>
                      <p className="text-sm text-gray-500">Punjab, India</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">1,000 kg</span>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">₹45/kg</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      A
                    </span>
                    <span className="text-yellow-400">⭐⭐⭐⭐</span>
                    <span className="text-xs text-gray-500">(4/5)</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-gray-900">10/01/2025</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-600 hover:text-gray-900">👁️</button>
                    <button className="p-1 text-gray-600 hover:text-gray-900">✏️</button>
                    <button className="p-1 text-red-600 hover:text-red-700">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimpleFarmerDashboard;