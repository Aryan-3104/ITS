import React from 'react';

export function ParkLogo({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="48" height="48" rx="10" fill="url(#g)" />
      <path d="M14 30V18a6 6 0 016-6h8v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="32" r="3" fill="white" />
      <circle cx="30" cy="32" r="3" fill="white" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5a4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconSlot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3" width="18" height="12" rx="2" stroke="#0f172a" strokeWidth="1.2" />
      <path d="M7 15v4" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 15v4" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
