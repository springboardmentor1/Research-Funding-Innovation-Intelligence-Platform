import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <h1 className="text-6xl font-extrabold text-blue-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-6">The page you are looking for does not exist or has been moved.</p>
      <a href="/" className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition">
        Return Home
      </a>
    </div>
  );
}
