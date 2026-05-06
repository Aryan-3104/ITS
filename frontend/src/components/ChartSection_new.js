import React from 'react';

export default function ChartSection({ title, children }) {
  return (
    <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6">
      <h4 className="text-lg font-semibold text-[--text-primary] mb-4 font-display">{title}</h4>
      <div style={{ minHeight: 300 }}>{children}</div>
    </div>
  );
}
