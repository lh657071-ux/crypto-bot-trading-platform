import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Crypto Trading Bot</h1>
      <p className="text-gray-300">Welcome to your trading dashboard. Coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
