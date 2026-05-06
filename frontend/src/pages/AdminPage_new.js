import React, { useState, useEffect } from 'react';
import { adminLogin, getAnalytics, getSlots, updateSlot, getSessions, setAdminToken, getRates, updateRate } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import ChartSection from '../components/ChartSection';
import { LogOut, X } from 'lucide-react';

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
    setLoading(true);
    try {
      const response = await adminLogin(password);
      setAdminToken(response.data.token);
      setIsAuthenticated(true);
      setPassword('');
      setError('');
      await fetchAnalytics();
    } catch (err) {
      setError('Invalid password');
    } finally {
      setLoading(false);
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
      const interval = setInterval(fetchAnalytics, 30000);
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
      <div className="min-h-screen bg-[--bg-base] flex items-center justify-center p-4">
        <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <h1 className="text-4xl font-display font-bold text-[--text-primary] mb-2 text-center">ParkSmart</h1>
          <p className="text-[--text-muted] text-center mb-8 text-sm">Admin Dashboard</p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[--bg-elevated] border border-[--border] rounded-lg px-4 py-3 text-[--text-primary] focus:ring-2 focus:ring-[--accent-blue] outline-none transition"
                placeholder="Enter admin password"
                autoComplete="off"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm flex justify-between items-center">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')}><X size={16} /></button>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full btn-primary font-semibold py-3 disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-[--text-muted] text-xs mt-6">
            Demo password: <code className="bg-[--bg-elevated] px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`px-4 py-3 font-medium text-sm uppercase tracking-wider transition-all duration-200 border-b-2 ${
        selectedTab === id
          ? 'border-[--accent-blue] text-[--accent-blue]'
          : 'border-transparent text-[--text-muted] hover:text-[--text-primary]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[--bg-surface] border-b border-[--border] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-[--text-primary]">Command Center</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminToken(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[--bg-elevated] hover:bg-red-500/10 text-[--text-muted] hover:text-red-400 rounded-lg transition"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-t border-[--border] flex gap-8 px-6">
          <TabButton id="dashboard" label="Dashboard" />
          <TabButton id="slots" label="Slot Management" />
          <TabButton id="sessions" label="Session Log" />
          <TabButton id="rates" label="Billing" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')}><X size={20} /></button>
          </div>
        )}

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && analytics && (
          <div className="space-y-8">
            <h2 className="text-3xl font-display font-bold text-[--text-primary]">Live Metrics</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Occupancy Rate" 
                value={`${analytics.occupancy_rate}%`} 
                trend="+2.5% today"
              />
              <StatCard 
                title="Today's Revenue" 
                value={`₹${analytics.today_revenue}`} 
                trend="↑ Active"
              />
              <StatCard 
                title="Sessions Today" 
                value={analytics.today_sessions} 
                trend="ongoing"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSection title="Hourly Revenue Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.hourly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="revenue" fill="var(--accent-blue)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Vehicle Type Distribution">
                <div className="space-y-4">
                  {analytics.vehicle_type_breakdown.map((item) => {
                    const percentage = Math.round((item.count / (analytics.today_sessions || 1)) * 100);
                    return (
                      <div key={item.vehicle_type}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{item.vehicle_type}</span>
                          <span className="text-sm text-[--text-muted]">{item.count} sessions</span>
                        </div>
                        <div className="w-full h-2 bg-[--bg-elevated] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[--accent-blue] to-[--accent-green]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ChartSection>
            </div>
          </div>
        )}

        {/* Slot Management Tab */}
        {selectedTab === 'slots' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-[--text-primary]">Slot Management</h2>
            <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                {slots.map((slot) => {
                  const statusColors = {
                    available: 'bg-[--accent-green]/10 border-[--accent-green]/50 text-[--accent-green]',
                    occupied: 'bg-[--accent-red]/10 border-[--accent-red]/50 text-[--accent-red]',
                    reserved: 'bg-[--accent-amber]/10 border-[--accent-amber]/50 text-[--accent-amber]',
                    unavailable: 'bg-[--accent-grey]/10 border-[--accent-grey]/50 text-[--accent-grey]',
                  };
                  return (
                    <div
                      key={slot.slot_id}
                      className={`p-3 rounded-lg text-center font-semibold text-sm transition border
                        ${statusColors[slot.status] || statusColors.unavailable}
                      `}
                      title={`${slot.slot_id} - ${slot.category} - ₹${slot.rate_per_hour}/hr`}
                    >
                      <div className="font-display font-bold">{slot.slot_id.split('-')[1]}</div>
                      <div className="text-xs uppercase tracking-widest mt-1">{slot.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Session Log Tab */}
        {selectedTab === 'sessions' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-[--text-primary]">Session Log</h2>
            <div className="bg-[--bg-surface] border border-[--border] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[--bg-elevated] border-b border-[--border]">
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Booking ID</th>
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Slot</th>
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Driver</th>
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Vehicle</th>
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Check-in</th>
                      <th className="px-4 py-3 text-left text-[--text-muted] uppercase tracking-widest font-semibold">Check-out</th>
                      <th className="px-4 py-3 text-right text-[--text-muted] uppercase tracking-widest font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, idx) => (
                      <tr 
                        key={session.booking_id} 
                        className={`border-b border-[--border] transition hover:bg-[--bg-elevated]
                          ${idx % 2 === 0 ? 'bg-[--bg-base]' : 'bg-[--bg-surface]'}
                        `}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[--accent-blue]">{session.booking_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-semibold">{session.slot_id}</td>
                        <td className="px-4 py-3">{session.driver_name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{session.vehicle_number}</td>
                        <td className="px-4 py-3 text-[--text-muted] text-xs">{new Date(session.checkin_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[--text-muted] text-xs">{new Date(session.checkout_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-[--accent-green]">₹{session.amount_charged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Billing Rules Tab */}
        {selectedTab === 'rates' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-[--text-primary]">Billing Configuration</h2>
            <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6">
              <p className="text-[--text-muted] text-sm mb-8">
                Set minimum charges and hourly rates. The final bill is the greater of min charge or (rate × duration).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['2W', '4W', 'EV'].map((vehicleType) => (
                  <div key={vehicleType} className="bg-[--bg-elevated] border border-[--border] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[--text-primary] mb-4 font-display">{vehicleType}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-2">
                          Minimum Charge (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={rateForm[vehicleType]?.min_charge ?? ''}
                          onChange={(e) => handleRateChange(vehicleType, 'min_charge', e.target.value)}
                          className="w-full bg-[--bg-surface] border border-[--border] rounded-lg px-3 py-2 text-[--text-primary] focus:ring-2 focus:ring-[--accent-blue] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[--text-muted] mb-2">
                          Hourly Rate (₹/hr)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={rateForm[vehicleType]?.hourly_rate ?? ''}
                          onChange={(e) => handleRateChange(vehicleType, 'hourly_rate', e.target.value)}
                          className="w-full bg-[--bg-surface] border border-[--border] rounded-lg px-3 py-2 text-[--text-primary] focus:ring-2 focus:ring-[--accent-blue] outline-none"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => saveRate(vehicleType)} 
                        className="w-full btn-primary font-semibold py-2.5 text-sm"
                      >
                        Save {vehicleType}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, trend }) => (
  <div className="bg-[--bg-surface] border border-[--border] rounded-xl p-6 border-l-4 border-l-[--accent-blue]">
    <h3 className="text-sm uppercase tracking-widest text-[--text-muted] mb-2">{title}</h3>
    <div className="flex items-baseline justify-between">
      <div className="text-4xl font-display font-bold text-[--text-primary]">{value}</div>
      <div className="text-xs font-medium text-[--accent-green]">{trend}</div>
    </div>
  </div>
);

export default AdminPage;
