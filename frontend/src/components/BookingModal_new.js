import React, { useState, useEffect } from 'react';
import { createBooking } from '../api/client';
import { X, Loader } from 'lucide-react';

export default function BookingModal({ open, slot, onClose, onSuccess, setError }) {
  const [form, setForm] = useState({
    driver_name: '',
    vehicle_number: '',
    arrival_time: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slot && open) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setForm(prev => ({
        ...prev,
        arrival_time: now.toISOString().slice(0, 16),
      }));
    }
  }, [slot, open]);

  if (!open || !slot) return null;

  const getCategoryLabel = (cat) => {
    const labels = {
      '2W': '2-Wheeler', '4W': '4-Wheeler', 'EV': 'Electric Vehicle', 'Disabled': 'Differently-Abled'
    };
    return labels[cat] || cat;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(setError) setError('');
    try {
      const response = await createBooking({
        slot_id: slot.slot_id,
        vehicle_type: slot.category,
        ...form,
      });
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Booking failed. Please try again.';
      if(setError) setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[--bg-elevated] border border-[--border] rounded-xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold">Book <span className="text-[--accent-blue]">{slot.slot_id}</span></h2>
          <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary] transition">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 bg-[--bg-surface] p-4 rounded-lg border border-[--border] flex justify-between items-center">
          <div>
            <div className="text-xs text-[--text-muted] uppercase tracking-widest">Category</div>
            <div className="font-semibold">{getCategoryLabel(slot.category)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[--text-muted] uppercase tracking-widest">Rate</div>
            <div className="font-semibold">₹{slot.rate_per_hour}/hr</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-1">Driver Name</label>
            <input
              type="text"
              required
              value={form.driver_name}
              onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
              className="w-full bg-[--bg-surface] border border-[--border] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[--accent-blue] outline-none transition"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-1">Vehicle Number</label>
            <input
              type="text"
              required
              value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
              className="w-full bg-[--bg-surface] border border-[--border] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[--accent-blue] outline-none transition"
              placeholder="e.g., DL01AB1234"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-1">Estimated Arrival</label>
            <input
              type="datetime-local"
              required
              value={form.arrival_time}
              onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
              className="w-full bg-[--bg-surface] border border-[--border] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[--accent-blue] outline-none transition"
            />
          </div>
          <div className="pt-6 space-y-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[--accent-blue] text-white font-semibold rounded-lg py-3 hover:brightness-110 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading && <Loader className="animate-spin" size={18} />}
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-[--bg-surface] text-[--text-primary] font-semibold rounded-lg py-2.5 border border-[--border] hover:bg-[--bg-elevated] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
