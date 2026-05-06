import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BookingModal({ open, slot, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || { driver_name: '', vehicle_number: '', vehicle_type: '4W', arrival_time: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initial || { driver_name: '', vehicle_number: '', vehicle_type: slot?.category || '4W', arrival_time: '' });
  }, [slot, initial]);

  if (!open || !slot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.driver_name || !form.vehicle_number || !form.arrival_time) {
      setError('Please fill required fields');
      return;
    }
    setError('');
    onSubmit && onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="relative bg-white/4 text-slate-100 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 border border-white/6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Reserve {slot.slot_id}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input required value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} className="peer w-full bg-transparent border border-white/6 rounded-lg px-3 py-2" />
              <label className="absolute left-3 -top-3 text-xs text-white/60">Driver Name</label>
            </div>
            <div className="relative">
              <input required value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} className="peer w-full bg-transparent border border-white/6 rounded-lg px-3 py-2" />
              <label className="absolute left-3 -top-3 text-xs text-white/60">Vehicle Number</label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="w-full bg-transparent border border-white/6 rounded-lg px-3 py-2">
                <option value={slot.category}>{slot.category}</option>
              </select>
            </div>
            <div>
              <input required type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} className="w-full bg-transparent border border-white/6 rounded-lg px-3 py-2" />
            </div>
          </div>

          {error && <div className="text-rose-400">{error}</div>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent border border-white/6 text-slate-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 text-white">Reserve</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
