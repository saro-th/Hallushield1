import React from 'react';

export default function Welcome({ onLogout }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-10 text-center bg-white rounded-xl shadow-sm">
        <h1 className="mb-4 text-5xl font-extrabold text-gray-900">
          Welcome! 👋
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          You have successfully logged into the application.
        </p>
        
        <button 
          onClick={onLogout} 
          className="px-6 py-2 font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}