import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-semibold text-white">404</h1>
        <p className="text-neutral-400">This page could not be found.</p>
        <p className="text-xs text-neutral-600">The requested URL was not found on this server.</p>
        <a href="/" className="text-sm transition-colors underline text-neutral-400 hover:text-white">Home</a>
      </div>
    </div>
  );
}