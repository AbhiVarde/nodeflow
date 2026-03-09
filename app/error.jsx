'use client';

import { useState } from 'react';

function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-semibold text-white">Error</h1>
        <p className="text-neutral-400">Something went wrong.</p>
        <p className="text-xs text-neutral-600">An unexpected error occurred.</p>
        {error.statusCode && <p className="text-xs text-neutral-600">Status Code: {error.statusCode}</p>}
        <button onClick={reset} className="text-sm transition-colors underline text-neutral-400 hover:text-white">Try again</button>
      </div>
    </div>
  );
}

export default Error;