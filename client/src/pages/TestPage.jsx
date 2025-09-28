import React from 'react';

const TestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Test Page - Working!
      </h1>
      <p className="text-lg text-gray-600">
        If you can see this, the routing and basic React rendering is working.
      </p>
      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">
          ✅ React is rendering
          <br />
          ✅ Routing is working  
          <br />
          ✅ CSS classes are loading
        </p>
      </div>
    </div>
  );
};

export default TestPage;