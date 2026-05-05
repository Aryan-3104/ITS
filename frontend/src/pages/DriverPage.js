import React, { useState, useEffect } from 'react';
import { getSlots, createBooking, getPrediction } from '../api/client';

function DriverPage() {
  const [slots, setSlots] = useState([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    driver_name: '',
    vehicle_number: '',
    vehicle_type: '4W',
    arrival_time: '',
  });
  const [bookingResult, setBookingResult] = useState(null);
  const [prediction, setPrediction] = useState(null);
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
    const interval = setInterval(fetchSlots, 10000);
    return () => clearInterval(interval);
  }, [vehicleTypeFilter, availableOnlyFilter]);

  // Fetch prediction
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await getPrediction();
        setPrediction(response.data);
      } catch (err) {
        console.error('Failed to fetch prediction', err);
      }
    };

    fetchPrediction();
  }, []);

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      const vehicleTypeMap = {
        '2W': '2W',
        '4W': '4W',
        'EV': 'EV',
        'Disabled': 'Disabled',
      };
      setBookingForm({
        ...bookingForm,
        vehicle_type: vehicleTypeMap[slot.category] || '4W',
      });
      setError('');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate vehicle type matches slot category
    if (selectedSlot.category !== bookingForm.vehicle_type) {
      setError(`This slot is for ${selectedSlot.category} vehicles only. Please select a ${selectedSlot.category} slot or change your vehicle type.`);
      return;
    }
    
    try {
      const response = await createBooking({
        slot_id: selectedSlot.slot_id,
        ...bookingForm,
      });
      setBookingResult(response.data);
      setSelectedSlot(null);
      setBookingForm({ driver_name: '', vehicle_number: '', vehicle_type: '4W', arrival_time: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  const groupSlotsByCategory = (slotsList) => {
    const categoryOrder = ['2W', '4W', 'EV', 'Disabled'];
    const grouped = {};
    
    categoryOrder.forEach(cat => {
      grouped[cat] = slotsList.filter(s => s.category === cat);
    });
    
    return grouped;
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      '2W': '2-Wheeler',
      '4W': '4-Wheeler',
      'EV': 'Electric Vehicle',
      'Disabled': 'Differently-abled',
    };
    return labels[cat] || cat;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">ParkSmart Driver Portal</h1>
        <p className="text-gray-600 mb-8">Find and book your parking slot</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading slots...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="2W">2-Wheeler</option>
                    <option value="4W">4-Wheeler</option>
                    <option value="EV">EV</option>
                    <option value="Disabled">Differently-abled</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={availableOnlyFilter}
                      onChange={(e) => setAvailableOnlyFilter(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show available only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Slot Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Parking Slots</h2>
              
              {/* Show categories with distribution */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {['2W', '4W', 'EV', 'Disabled'].map((cat) => {
                  const catSlots = slots.filter(s => s.category === cat);
                  const occupied = catSlots.filter(s => s.status === 'occupied').length;
                  const available = catSlots.filter(s => s.status === 'available').length;
                  return (
                    <div key={cat} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                      <p className="text-sm font-bold text-blue-900">{getCategoryLabel(cat)}</p>
                      <div className="text-xs text-gray-600 mt-1">
                        <p>Total: {catSlots.length}</p>
                        <p className="text-green-600">Available: {available}</p>
                        <p className="text-red-600">Occupied: {occupied}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slots grouped by category */}
              {Object.entries(groupSlotsByCategory(slots)).map(([category, categorySlots]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">{getCategoryLabel(category)} ({categorySlots.length} slots)</h3>
                  <div className="grid grid-cols-10 gap-2 mb-4">
                    {categorySlots.map((slot) => (
                      <button
                        key={slot.slot_id}
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.status !== 'available'}
                        className={`p-3 rounded font-bold text-white transition text-xs ${getSlotColor(slot.status)} ${
                          slot.status === 'available' ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-75'
                        }`}
                        title={`${slot.slot_id} (${slot.category}) - ₹${slot.rate_per_hour}/hr`}
                      >
                        {slot.slot_id.split('-')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-4 text-sm mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-500 rounded"></div>
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            {selectedSlot && !bookingResult && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">Book Slot {selectedSlot.slot_id}</h2>
                <p className="text-sm text-gray-600 mb-4">Category: <span className="font-bold">{getCategoryLabel(selectedSlot.category)}</span> | Rate: <span className="font-bold">₹{selectedSlot.rate_per_hour}/hour</span></p>
                <form onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driver Name
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingForm.driver_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, driver_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingForm.vehicle_number}
                        onChange={(e) => setBookingForm({ ...bookingForm, vehicle_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., AB12CD1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type <span className="text-xs text-gray-500">(must match slot category)</span>
                      </label>
                      <select
                        value={bookingForm.vehicle_type}
                        onChange={(e) => {
                          setBookingForm({ ...bookingForm, vehicle_type: e.target.value });
                          setError('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
                        disabled
                      >
                        <option value={selectedSlot.category}>{getCategoryLabel(selectedSlot.category)}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={bookingForm.arrival_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, arrival_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Book Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(null)}
                      className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Booking Result */}
            {bookingResult && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded mb-8">
                <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                <p>Booking ID: <strong>{bookingResult.booking_id}</strong></p>
                <p>Slot: <strong>{bookingResult.slot_id}</strong></p>
                <p>Amount: <strong>₹{bookingResult.amount_charged}</strong></p>
                <button
                  onClick={() => setBookingResult(null)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book Another Slot
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DriverPage;
