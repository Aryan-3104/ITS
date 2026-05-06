import React from 'react';

const SlotCard = ({ slot, onClick, isNearest }) => {
  const { slot_id, status } = slot;

  const statusStyles = {
    available: {
      bg: 'bg-[--accent-green]/10',
      text: 'text-[--accent-green]',
      border: 'border-[--accent-green]/50',
      hover: 'hover:bg-[--accent-green]/20 hover:border-[--accent-green]/80 hover:scale-105',
    },
    occupied: {
      bg: 'bg-[--accent-red]/10',
      text: 'text-[--accent-red]',
      border: 'border-[--accent-red]/50',
      hover: 'cursor-not-allowed',
    },
    reserved: {
      bg: 'bg-[--accent-amber]/10',
      text: 'text-[--accent-amber]',
      border: 'border-[--accent-amber]/50',
      hover: 'cursor-not-allowed',
    },
    unavailable: {
      bg: 'bg-[--accent-grey]/10',
      text: 'text-[--accent-grey]',
      border: 'border-[--accent-grey]/50',
      hover: 'cursor-not-allowed',
    },
  };

  const styles = statusStyles[status] || statusStyles.unavailable;
  const glowColor = {
    available: 'shadow-[0_0_12px_var(--accent-green)]',
    occupied: 'shadow-[0_0_12px_var(--accent-red)]',
    reserved: 'shadow-[0_0_12px_var(--accent-amber)]',
    unavailable: '',
  }[status];

  return (
    <button
      onClick={() => {
        if (status === 'available' && onClick) onClick(slot);
      }}
      className={`relative w-full h-[80px] flex flex-col items-center justify-center rounded-lg border transition-all duration-300
        ${styles.bg} ${styles.text} ${styles.border} ${styles.hover}
        ${glowColor}
        focus:outline-none focus:ring-2 focus:ring-[--accent-blue]
      `}
      aria-label={`Slot ${slot_id}, ${status}, ${slot.category}`}
      disabled={status !== 'available'}
    >
      {isNearest && status === 'available' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--accent-blue] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[--accent-blue]"></span>
        </span>
      )}
      <div className="font-display font-bold text-xl">{slot_id.split('-')[1]}</div>
      <div className="text-xs uppercase tracking-widest font-medium mt-1">{status}</div>
    </button>
  );
};

export default SlotCard;
