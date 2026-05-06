import React, { useState, useEffect } from 'react';
import { adminLogin, getAnalytics, getSlots, updateSlot, getSessions, setAdminToken, getRates, updateRate } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import ChartSection from '../components/ChartSection';

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [rates, setRates] = useState([]);
  const [rateForm, setRateForm] = useState({});
  const [slots, setSlots] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(password);
      setAdminToken(response.data.token);
      setIsAuthenticated(true);
      setPassword('');
      setError('');
      await fetchAnalytics();
    } catch (err) {
      setError('Invalid password');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getAnalytics();
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await getSlots();
      setSlots(response.data);
    } catch (err) {
      setError('Failed to fetch slots');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await getSessions({ limit: 100 });
      setSessions(response.data);
    } catch (err) {
      setError('Failed to fetch sessions');
    }
  };

  const fetchRates = async () => {
    try {
      const response = await getRates();
      setRates(response.data);

      const initialForm = {};
      response.data.forEach((item) => {
        initialForm[item.vehicle_type] = {
          min_charge: item.min_charge,
          hourly_rate: item.hourly_rate,
        };
      });
      setRateForm(initialForm);
    } catch (err) {
      setError('Failed to fetch rates');
    }
  };

  const handleRateChange = (vehicleType, field, value) => {
    setRateForm((prev) => ({
      ...prev,
      [vehicleType]: {
        ...prev[vehicleType],
        [field]: value,
      },
    }));
  };

  const saveRate = async (vehicleType) => {
    try {
      const payload = rateForm[vehicleType];
      await updateRate(vehicleType, {
        min_charge: Number(payload.min_charge),
        hourly_rate: Number(payload.hourly_rate),
      });
      await fetchRates();
      setError('');
    } catch (err) {
      setError('Failed to update rate');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      fetchRates();
      const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedTab === 'slots') {
      fetchSlots();
    }
  }, [isAuthenticated, selectedTab]);

  useEffect(() => {
    if (isAuthenticated && selectedTab === 'sessions') {
      fetchSessions();
    }
  }, [isAuthenticated, selectedTab]);

    if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">ParkSmart Admin</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter admin password"
                autoComplete="off"
              />
            </div>
            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
            <button type="submit" className="w-full btn-primary font-bold">Login</button>
          </form>
          <p className="text-center text-gray-600 text-sm mt-6">
            Default password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#071028] text-slate-200 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ParkSmart Admin</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminToken(null);
            }}
            className="px-4 py-2 bg-white/6 hover:bg-white/10 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 bg-[#071028]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`py-4 px-2 font-medium transition ${
                selectedTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab('slots')}
              className={`py-4 px-2 font-medium transition ${
                selectedTab === 'slots'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Slot Management
            </button>
            <button
              onClick={() => setSelectedTab('sessions')}
              className={`py-4 px-2 font-medium transition ${
                selectedTab === 'sessions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Session Log
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && analytics && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <DashboardCard title="Occupancy Rate" value={`${analytics.occupancy_rate}%`} accentClass="text-slate-100" />
              <DashboardCard title="Today's Revenue" value={`₹${analytics.today_revenue}`} accentClass="text-slate-100" />
              <DashboardCard title="Sessions Today" value={analytics.today_sessions} accentClass="text-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartSection title="Hourly Revenue">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.hourly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#7b8794" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Vehicle Type Breakdown">
                <div className="space-y-2">
                  {analytics.vehicle_type_breakdown.map((item) => (
                    <div key={item.vehicle_type} className="flex justify-between items-center">
                      <span className="text-slate-200">{item.vehicle_type}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-600 rounded h-6" style={{ width: `${(item.count / (analytics.today_sessions || 1)) * 200}px` }}></div>
                        <span className="font-bold text-slate-200">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>
            </div>

            <div className="card mt-6">
              <h3 className="text-lg font-bold mb-4">Billing Rules</h3>
              <p className="text-sm text-gray-600 mb-4">Minimum charge applies to every checkout, and the total is the greater of the minimum charge or hourly charge.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['2W', '4W', 'EV'].map((vehicleType) => (
                  <div key={vehicleType} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{vehicleType}</h4>
                    <label className="block text-sm text-gray-700 mb-1">Minimum Charge (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={rateForm[vehicleType]?.min_charge ?? ''}
                      onChange={(e) => handleRateChange(vehicleType, 'min_charge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                    />
                    <label className="block text-sm text-gray-700 mb-1">Hourly Rate (₹/hr)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={rateForm[vehicleType]?.hourly_rate ?? ''}
                      onChange={(e) => handleRateChange(vehicleType, 'hourly_rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                    />
                    <button type="button" onClick={() => saveRate(vehicleType)} className="w-full btn-primary font-bold">Save {vehicleType}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slot Management Tab */}
        {selectedTab === 'slots' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Slot Management</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.slot_id}
                  className={`p-3 rounded text-white text-center cursor-pointer font-bold transition hover:shadow-lg ${
                    slot.status === 'available'
                      ? 'bg-green-500'
                      : slot.status === 'occupied'
                      ? 'bg-red-500'
                      : slot.status === 'reserved'
                      ? 'bg-amber-500'
                      : 'bg-gray-400'
                  }`}
                  title={`${slot.slot_id} - ${slot.category} - ₹${slot.rate_per_hour}/hr`}
                >
                  {slot.slot_id.split('-')[1]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Log Tab */}
        {selectedTab === 'sessions' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Session Log</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">Slot</th>
                    <th className="px-4 py-2 text-left">Driver</th>
                    <th className="px-4 py-2 text-left">Vehicle</th>
                    <th className="px-4 py-2 text-left">Check-in</th>
                    <th className="px-4 py-2 text-left">Check-out</th>
                    <th className="px-4 py-2 text-right">Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.booking_id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-sm">{session.booking_id.slice(0, 8)}</td>
                      <td className="px-4 py-2">{session.slot_id}</td>
                      <td className="px-4 py-2">{session.driver_name}</td>
                      <td className="px-4 py-2">{session.vehicle_number}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{new Date(session.checkin_time).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{new Date(session.checkout_time).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-bold">₹{session.amount_charged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
