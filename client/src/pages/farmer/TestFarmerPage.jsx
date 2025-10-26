import React from 'react';

const TestFarmerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        🚀 Farmer Test Page Working!
      </h1>
      <div className="bg-green-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          ✅ Success! 
        </h2>
        <p className="text-green-700">
          If you can see this page, then:
        </p>
        <ul className="list-disc list-inside mt-2 text-green-700">
          <li>React Router is working correctly</li>
          <li>Farmer pages directory is accessible</li>
          <li>Component imports are functioning</li>
          <li>CSS/Tailwind is loading properly</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-blue-700">
            <strong>Next steps:</strong> Navigate to `/farmer/dashboard` or `/farmer/dashboard-simple` to test the full farmer components.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestFarmerPage;