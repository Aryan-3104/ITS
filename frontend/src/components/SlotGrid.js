import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import SlotCard from './SlotCard';

const SlotGrid = ({ slots, loading, onSlotClick, nearestSlotId, adminMode = false }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  const groupSlotsByCategory = (slotsList) => {
    const categoryOrder = ['2W', '4W', 'EV', 'Disabled'];
    const grouped = categoryOrder.map(cat => ({
      category: cat,
      slots: slotsList.filter(s => s.category === cat),
    }));
    return grouped.filter(g => g.slots.length > 0);
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      '2W': '2-Wheeler',
      '4W': '4-Wheeler',
      'EV': 'Electric Vehicle',
      'Disabled': 'Differently-Abled',
    };
    return labels[cat] || cat;
  };

  const groupedSlots = groupSlotsByCategory(slots);

  return (
    <div className="space-y-8 bg-[--bg-surface] border border-[--border] rounded-xl p-6">
      {groupedSlots.length === 0 ? (
        <div className="text-center py-12 text-[--text-muted]">
          <p>No slots available matching your filters.</p>
        </div>
      ) : (
        groupedSlots.map(({ category, slots: categorySlots }) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-[--text-muted] mb-4 tracking-wider uppercase">
              {getCategoryLabel(category)} · {categorySlots.length} slots
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
              {categorySlots.map((slot) => (
                <SlotCard
                  key={slot.slot_id}
                  slot={slot}
                  onClick={() => onSlotClick(slot)}
                  isNearest={slot.slot_id === nearestSlotId}
                  adminMode={adminMode}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SlotGrid;
