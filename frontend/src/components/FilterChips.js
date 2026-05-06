import React from 'react';

const chipList = ['2W','4W','EV','Disabled'];

export default function FilterChips({ filters = {}, setFilters }) {
  const toggle = (type) => {
    const active = filters.type === type ? '' : type;
    setFilters && setFilters({ ...filters, type: active });
  };

  return (
    <div className="flex items-center gap-2">
      {chipList.map((c) => (
        <button
          key={c}
          onClick={() => toggle(c)}
          className={`px-3 py-1 rounded-full text-sm transition border ${filters.type === c ? 'bg-white/6 border-white/10 text-white' : 'bg-transparent border-slate-700 text-slate-300 hover:bg-white/3'}`}
        >
          {c}
        </button>
      ))}
      <button onClick={() => setFilters && setFilters({ ...filters, status: filters.status === 'available' ? '' : 'available' })} className={`px-3 py-1 rounded-full text-sm transition ${filters.status === 'available' ? 'bg-white/6 text-white border-white/10' : 'bg-transparent text-slate-300 border-slate-700 hover:bg-white/3'}`}>
        Available
      </button>
    </div>
  );
}
