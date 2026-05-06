import React from 'react';

export default function DashboardCard({ title, value, accentClass = 'text-[--text-primary]', children }) {
  return (
    <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 border-l-4 border-l-[--accent-blue]">
      <p className="text-xs uppercase tracking-widest text-[--text-muted] mb-2">{title}</p>
      <div className={`text-4xl font-display font-bold ${accentClass}`}>{value}</div>
      {children}
    </div>
  );
}
