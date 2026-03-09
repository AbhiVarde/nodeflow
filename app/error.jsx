'use client';

function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-900">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-light text-white">Error</h1>
        <p className="text-lg text-neutral-300">Something went wrong</p>
        <p className="text-sm text-neutral-500">An unexpected error occurred.</p>
        {error.statusCode && <p className="text-sm text-neutral-500">Status Code: {error.statusCode}</p>}
        <button onClick={reset} className="inline-block mt-6 text-sm transition-colors text-neutral-400 hover:text-white">Try again</button>
      </div>
    </div>
  );
}

export default Error;