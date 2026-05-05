import React, { useState, useEffect } from 'react';
import { adminLogin, getAnalytics, getSlots, updateSlot, getSessions, setAdminToken } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [analytics, setAnalytics] = useState(null);
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
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
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
            >
              Login
            </button>
          </form>
          <p className="text-center text-gray-600 text-sm mt-6">
            Default password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">ParkSmart Admin</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminToken(null);
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 bg-white">
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
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Occupancy Rate</p>
                <p className="text-4xl font-bold text-blue-600">{analytics.occupancy_rate}%</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Today's Revenue</p>
                <p className="text-4xl font-bold text-green-600">₹{analytics.today_revenue}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Sessions Today</p>
                <p className="text-4xl font-bold text-orange-600">{analytics.today_sessions}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Hourly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.hourly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Vehicle Type Breakdown</h3>
                <div className="space-y-2">
                  {analytics.vehicle_type_breakdown.map((item) => (
                    <div key={item.vehicle_type} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.vehicle_type}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-600 rounded h-6" style={{ width: `${(item.count / (analytics.today_sessions || 1)) * 200}px` }}></div>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slot Management Tab */}
        {selectedTab === 'slots' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Slot Management</h2>
            <div className="grid grid-cols-10 gap-2">
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
