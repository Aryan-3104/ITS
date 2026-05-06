import React from 'react';

export default function Toast({ message, type = 'info' }) {
  if (!message) return null;
  const colors = {
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
  };

  return (
    <div className={`fixed bottom-6 right-6 text-white px-4 py-2 rounded-lg shadow-lg ${colors[type]}`}>
      {message}
    </div>
  );
}
