import React from 'react';
import SlotCard from './SlotCard';
import Legend from './Legend';
import FilterChips from './FilterChips';

export default function SlotGrid({ slots = [], loading, onSlotClick, filters, setFilters, nearestSlotId }) {
  const categories = ['2W', '4W', 'EV', 'Disabled'];

  const grouped = categories.map((cat) => ({
    cat,
    items: slots.filter((s) => s.category === cat),
  }));

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <Legend />
        <FilterChips filters={filters} setFilters={setFilters} />
      </div>

      <div className="space-y-6">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <h3 className="text-sm text-slate-300 font-semibold mb-2">{cat} · {items.length} slots</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
              {items.map((slot) => (
                <SlotCard key={slot.slot_id} slot={slot} onClick={onSlotClick} isNearest={nearestSlotId === slot.slot_id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
