import React from 'react';
import { motion } from 'framer-motion';
import { IconSlot } from './Icons';

const statusStyles = {
  available: 'bg-slate-800 ring-1 ring-emerald-500/30',
  occupied: 'bg-slate-800 ring-1 ring-rose-500/25',
  reserved: 'bg-slate-800 ring-1 ring-amber-400/20',
  unavailable: 'bg-slate-800 opacity-60',
};

export default function SlotCard({ slot, onClick, isNearest }) {
  const color = statusStyles[slot.status] || statusStyles.unavailable;

  return (
    <motion.button
      whileHover={{ scale: slot.status === 'available' ? 1.04 : 1 }}
      whileTap={{ scale: 0.98 }}
      layout
      onClick={() => onClick && onClick(slot)}
      disabled={slot.status !== 'available'}
      className={`relative flex flex-col items-center justify-center gap-1 p-3 rounded-2xl text-slate-100 shadow-sm transition ${
        slot.status === 'available' ? 'cursor-pointer hover:translate-y-0.5 hover:shadow-lg' : 'opacity-70 cursor-not-allowed'
      } ${color}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-2 bg-white/12 rounded-lg">
          <IconSlot />
        </div>
        <div className="text-sm font-semibold">{slot.slot_id.split('-')[1]}</div>
      </div>
      <div className="text-xs text-white/90">{slot.category}</div>

      {isNearest && (
        <motion.span
          className="absolute -top-3 right-2 w-3 h-3 rounded-full shadow-lg"
          animate={{ boxShadow: ["0 0 0 6px rgba(255,255,255,0.06)", "0 0 0 12px rgba(255,255,255,0.02)"] }}
        />
      )}
    </motion.button>
  );
}
