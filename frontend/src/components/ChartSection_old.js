import React from 'react';

export default function ChartSection({ title, children }) {
  return (
    <div className="bg-white/4 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-200 mb-3">{title}</h4>
      <div style={{ minHeight: 200 }}>{children}</div>
    </div>
  );
}
