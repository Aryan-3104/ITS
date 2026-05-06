import React from 'react';

const LoadingSkeleton = () => (
  <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 space-y-8">
    {[...Array(3)].map((_, i) => (
      <div key={i}>
        <div className="h-5 w-1/4 bg-[--bg-elevated] rounded-md mb-4 animate-pulse"></div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
          {[...Array(12)].map((_, j) => (
            <div key={j} className="w-full h-[80px] bg-[--bg-elevated] rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
