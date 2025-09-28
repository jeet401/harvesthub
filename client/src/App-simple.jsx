import React from 'react';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600">
        React is Working! 🎉
      </h1>
      <p className="mt-4 text-lg">
        If you can see this, React and Vite are working correctly.
      </p>
      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p>✅ React is rendering</p>
        <p>✅ Tailwind CSS is working</p>
        <p>✅ The build system is functional</p>
      </div>
    </div>
  );
}

export default App;