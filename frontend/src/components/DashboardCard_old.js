import React from 'react';

export default function DashboardCard({ title, value, accentClass = 'text-slate-200', children }) {
  return (
    <div className="bg-white/4 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/6">
      <p className="text-sm text-slate-300">{title}</p>
      <div className={`text-2xl font-bold ${accentClass}`}>{value}</div>
      {children}
    </div>
  );
}
