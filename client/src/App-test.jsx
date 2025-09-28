import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TestPage from './pages/TestPage.jsx';
import SimpleFarmerDashboard from './pages/farmer/SimpleFarmerDashboard.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">HarvestHub</h1>
            </div>
          </div>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to HarvestHub</h1>
            <div className="space-y-4">
              <a href="/test" className="block text-blue-600 hover:text-blue-800">
                → Go to Test Page
              </a>
              <a href="/farmer/dashboard" className="block text-green-600 hover:text-green-800">
                → Go to Farmer Dashboard
              </a>
            </div>
          </div>
        } />
        <Route path="/test" element={<TestPage />} />
        <Route path="/farmer/dashboard" element={<SimpleFarmerDashboard />} />
      </Routes>
    </div>
  );
}

export default App;