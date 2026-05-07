import React from 'react';
import { useNavigate } from 'react-router-dom';

function RoleCard({ title, desc, onClick, Icon, variant = 'primary' }) {
  const base =
    'flex flex-col items-start gap-3 p-5 rounded-xl shadow-sm transition transform hover:scale-[1.02] focus:scale-[1.02] focus:outline-none';
  const variants = {
    primary: 'bg-[--accent-blue] text-white',
    secondary: 'bg-[--bg-elevated] text-[--text-primary] border border-[--border]',
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} w-full text-left`} 
      aria-label={title}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10">
          <Icon />
        </div>
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-[--text-muted] mt-1">{desc}</div>
        </div>
      </div>
    </button>
  );
}

const IconCar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3 11l1.5-4A2 2 0 0 1 6.4 5h11.2a2 2 0 0 1 1.9 2l1.5 4v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5zM6.5 7a.5.5 0 0 0-.48.35L5 10h14l-1.02-2.65A.5.5 0 0 0 17.5 7H6.5z" />
  </svg>
);

const IconAdmin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 6v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1a6 6 0 0 0-12 0v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1c0-3.86 3.14-7 7-7h6c3.86 0 7 3.14 7 7z" />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[--bg-base] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-8 rounded-2xl bg-[--bg-surface] border border-[--border] shadow-2xl">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold text-[--text-primary]">ParkSmart</h1>
          <p className="text-[--text-muted] mt-2">Choose how you'd like to continue</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RoleCard
            title="Customer"
            desc="Find and reserve a parking slot quickly — get QR for gate check-in."
            onClick={() => navigate('/driver')}
            Icon={IconCar}
            variant="primary"
          />

          <RoleCard
            title="Admin"
            desc="Manage slots, bookings and view analytics. Requires admin access."
            onClick={() => navigate('/admin')}
            Icon={IconAdmin}
            variant="secondary"
          />
        </div>

        <p className="text-center text-sm text-[--text-muted] mt-6">
          Need help? Contact support or sign in with your admin credentials.
        </p>
      </div>
    </div>
  );
}
