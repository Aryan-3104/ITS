import React from 'react';

export default function Legend() {
  return (
    <div className="flex items-center gap-4 text-sm text-slate-300">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-slate-800 ring-1 ring-emerald-500/30 shadow-sm" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-slate-800 ring-1 ring-rose-500/25 shadow-sm" />
        <span>Occupied</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-slate-800 ring-1 ring-amber-400/20 shadow-sm" />
        <span>Reserved</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-slate-700 shadow-sm" />
        <span>Unavailable</span>
      </div>
    </div>
  );
}
