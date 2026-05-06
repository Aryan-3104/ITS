import React from 'react';

export default function LoadingSkeleton({ rows = 1 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-white/6 rounded w-full" />
      ))}
    </div>
  );
}
