import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse w-full">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className={`h-3 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
    ))}
  </div>
);

export const SkeletonRing = () => (
  <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
);

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-teal-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
