import React, { useState, useEffect } from 'react';
import { getSlots, checkIn, checkOut, completeCheckout } from '../api/client';
import SlotGrid from '../components/SlotGrid';
import BookingModal from '../components/BookingModal';
import Toast from '../components/Toast';
import { X } from 'lucide-react';

function DriverPage() {
  const [slots, setSlots] = useState([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [gateQrPayload, setGateQrPayload] = useState('');
  const [gateMessage, setGateMessage] = useState(null);
  const [checkoutBill, setCheckoutBill] = useState(null);
  const [error, setError] = useState('');

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const filters = {};
        if (vehicleTypeFilter) filters.type = vehicleTypeFilter;
        if (availableOnlyFilter) filters.status = 'available';
        
        const response = await getSlots(filters);
        setSlots(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch slots');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  }, [vehicleTypeFilter, availableOnlyFilter]);

  // Fetch prediction

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setError('');
    }
  };

  const handleBookingSuccess = (data) => {
    setBookingResult(data);
    setSelectedSlot(null);
    setGateQrPayload(data.qr_payload || '');
    setGateMessage({
      type: 'info',
      title: 'Reservation created',
      message: 'Proceed to the gate for check-in.',
    });
    setError('');
  }

  const handleCheckIn = async (e) => {
    e.preventDefault();

    if (!gateQrPayload.trim()) {
      setError('Enter the QR payload from your reservation to check in.');
      return;
    }

    try {
      const response = await checkIn(gateQrPayload.trim());
      setGateMessage({
        type: 'success',
        title: 'Check-in completed',
        message: `Slot ${response.data.slot_id} is now occupied. Welcome!`,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handlePreviewBill = async (e) => {
    e.preventDefault();

    if (!gateQrPayload.trim()) {
      setError('Enter the QR payload from your reservation to generate the bill.');
      return;
    }

    try {
      const response = await checkOut(gateQrPayload.trim());
      setCheckoutBill(response.data.bill);
      setGateMessage({
        type: 'info',
        title: 'Bill generated',
        message: 'Review the bill below and simulate payment when ready.',
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate bill');
    }
  };

  const handleCompletePayment = async () => {
    if (!gateQrPayload.trim() || !checkoutBill) {
      setError('Generate the bill first before completing payment.');
      return;
    }

    try {
      const response = await completeCheckout(gateQrPayload.trim(), checkoutBill.checkout_time);
      setGateMessage({
        type: 'success',
        title: 'Payment completed',
        message: `Slot ${response.data.bill.slot_id} is now free. Thank you!`,
      });
      setBookingResult(null);
      setCheckoutBill(null);
      setGateQrPayload('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment simulation failed');
    }
  };

  const FilterButton = ({ value, current, onClick, children }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center justify-center whitespace-nowrap border ${
        current === value
          ? 'bg-[--accent-blue] text-white border-[--accent-blue]'
          : 'bg-[--bg-surface] hover:bg-[--bg-elevated] text-[--text-muted] border-[--border]'
      }`}
    >
      {children}
    </button>
  );

  const handleUseQr = async (payload) => {
    if (!payload?.trim()) return setError('Missing booking payload');

    try {
      const response = await checkIn(payload.trim());
      setGateMessage({
        type: 'success',
        title: 'Check-in completed',
        message: `Slot ${response.data.slot_id} is now occupied. Welcome!`,
      });
      setBookingResult(null);
      // also set gate input for reference
      setGateQrPayload(payload.trim());
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCopyPayload = async (payload) => {
    if (!payload) return setError('Missing booking payload');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
        setGateMessage({ type: 'info', title: 'Copied', message: 'QR payload copied to clipboard.' });
      } else {
        // fallback to selecting and copying via execCommand
        setGateQrPayload(payload);
        setGateMessage({ type: 'info', title: 'Payload ready', message: 'QR payload placed in the gate input.' });
      }
      setGateQrPayload(payload || '');
      setError('');
    } catch (err) {
      setGateQrPayload(payload || '');
      setGateMessage({ type: 'info', title: 'Payload ready', message: 'QR payload placed in the gate input.' });
    }
  };

  const handleDownload = (payload) => {
    if (!payload) return setError('Missing booking payload');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(payload)}`;
    // open in new tab for user to download
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-[--text-primary] mb-2">Driver View</h1>
        <p className="text-[--text-muted] mb-8">Live parking availability and instant booking.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={18} /></button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Slot Map */}
          <div className="lg:col-span-2">
            <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterButton value="" current={vehicleTypeFilter} onClick={setVehicleTypeFilter}>All</FilterButton>
                  <FilterButton value="2W" current={vehicleTypeFilter} onClick={setVehicleTypeFilter}>2-Wheeler</FilterButton>
                  <FilterButton value="4W" current={vehicleTypeFilter} onClick={setVehicleTypeFilter}>4-Wheeler</FilterButton>
                  <FilterButton value="EV" current={vehicleTypeFilter} onClick={setVehicleTypeFilter}>EV</FilterButton>
                  <FilterButton value="Disabled" current={vehicleTypeFilter} onClick={setVehicleTypeFilter}>Disabled</FilterButton>
                </div>
                <div className="flex-grow" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnlyFilter}
                    onChange={(e) => setAvailableOnlyFilter(e.target.checked)}
                    className="w-4 h-4 rounded accent-[--accent-blue]"
                  />
                  <span className="text-sm text-[--text-muted] font-medium">Available Only</span>
                </label>
              </div>
            </div>

            <SlotGrid
              slots={slots}
              loading={loading}
              onSlotClick={handleSlotClick}
              nearestSlotId={slots.find(s => s.status === 'available')?.slot_id}
            />
          </div>

          {/* Right Column: Booking/Check-in */}
          <div className="lg:col-span-1 overflow-y-auto max-h-screen">
            {bookingResult ? (
              <QRCodeScreen
                booking={bookingResult}
                onDownload={handleDownload}
                onUseQr={handleUseQr}
                onCopyPayload={handleCopyPayload}
              />
            ) : (
              <div className="sticky top-24">
                <GateActions
                  gateQrPayload={gateQrPayload}
                  setGateQrPayload={setGateQrPayload}
                  handleCheckIn={handleCheckIn}
                  handlePreviewBill={handlePreviewBill}
                  checkoutBill={checkoutBill}
                  handleCompletePayment={handleCompletePayment}
                />
              </div>
            )}
          </div>
        </div>

        <BookingModal
          open={!!selectedSlot}
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleBookingSuccess}
          setError={setError}
        />

        <Toast 
          message={gateMessage?.message} 
          type={gateMessage?.type} 
          onClose={() => setGateMessage(null)} 
        />
      </div>
    </div>
  );
}

const QRCodeScreen = ({ booking, onDownload, onUseQr, onCopyPayload }) => (
  <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 text-center">
    <h2 className="text-2xl font-display font-bold mb-2">Booking Confirmed</h2>
    <p className="text-[--text-muted] text-sm mb-6">Scan this QR at the entry gate or use the actions below.</p>
    
    <div className="relative inline-block bg-white p-4 rounded-lg shadow-lg overflow-hidden mb-4">
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.qr_payload}`} 
        alt="Booking QR Code"
        className="z-10 w-[200px] h-[200px]"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[--accent-blue]/50 to-transparent animate-scanline z-20" />
    </div>

    <div className="text-left space-y-3 mb-4">
      <div className="flex justify-between pb-3 border-b border-[--border]">
        <span className="text-[--text-muted] text-sm">Slot ID</span>
        <span className="font-medium font-display">{booking.slot_id}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[--text-muted] text-sm">Driver</span>
        <span className="font-medium">{booking.driver_name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[--text-muted] text-sm">Vehicle</span>
        <span className="font-medium font-mono text-sm">{booking.vehicle_number}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[--text-muted] text-sm">Arrival</span>
        <span className="font-medium text-sm">{new Date(booking.arrival_time).toLocaleTimeString()}</span>
      </div>
    </div>

    <div className="text-sm text-left font-mono break-words bg-[--bg-elevated] p-3 rounded-md mb-4">{booking.qr_payload}</div>

    <div className="flex gap-3">
      <button
        onClick={() => onUseQr && onUseQr(booking.qr_payload)}
        className="flex-1 bg-[--accent-green] text-black font-bold py-3 rounded-lg hover:brightness-105 transition-all flex items-center justify-center"
      >
        Check-In Now
      </button>
      <button
        onClick={() => onCopyPayload && onCopyPayload(booking.qr_payload)}
        className="flex-1 border border-[--border] rounded-lg py-3 text-[--text-muted] flex items-center justify-center"
      >
        Copy Payload
      </button>
    </div>

    <button 
      onClick={() => onDownload && onDownload(booking.qr_payload)}
      className="w-full mt-4 py-3 rounded-lg border-2 border-[--accent-blue] text-[--accent-blue] font-semibold hover:bg-[--accent-blue]/10 transition-colors"
    >
      Download Token
    </button>
  </div>
);

const GateActions = ({ gateQrPayload, setGateQrPayload, handleCheckIn, handlePreviewBill, checkoutBill, handleCompletePayment }) => (
  <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 space-y-6">
    <div>
      <h3 className="text-xl font-bold mb-1">Gate Operations</h3>
      <p className="text-sm text-[--text-muted] mb-4">Enter your booking QR payload to check-in or check-out.</p>
      <input
        type="text"
        value={gateQrPayload}
        onChange={(e) => setGateQrPayload(e.target.value)}
        placeholder="Paste QR Payload..."
        className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[--accent-blue] outline-none"
      />
    </div>
    <div className="flex gap-3">
      <button onClick={handleCheckIn} className="btn-primary flex-1 text-sm py-3 flex items-center justify-center font-semibold">Check-In</button>
      <button onClick={handlePreviewBill} className="flex-1 bg-[--accent-amber] text-black font-semibold rounded-lg py-3 hover:brightness-110 transition-all text-sm flex items-center justify-center">Check-Out</button>
    </div>

    {checkoutBill && (
      <div className="border-t border-[--border] pt-6">
        <h4 className="text-lg font-bold mb-4">Bill Preview</h4>
        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between"><span className="text-[--text-muted]">Duration:</span> <span className="font-medium">{checkoutBill.duration_hours.toFixed(2)} hours</span></div>
          <div className="flex justify-between"><span className="text-[--text-muted]">Rate:</span> <span className="font-medium">₹{checkoutBill.rate_per_hour}/hr</span></div>
          <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-[--border]"><span>Total:</span> <span className="text-[--accent-green]">₹{checkoutBill.amount_charged}</span></div>
        </div>
        <button onClick={handleCompletePayment} className="w-full bg-[--accent-green] text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center">
          Pay ₹{checkoutBill.amount_charged}
        </button>
      </div>
    )}
  </div>
);

export default DriverPage;
