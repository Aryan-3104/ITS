import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ParkingCircle } from 'lucide-react';

export default function Navbar() {
  const activeLinkStyle = {
    backgroundColor: 'var(--bg-elevated)',
    borderLeft: '2px solid var(--accent-blue)',
  };

  return (
    <header className="bg-[--bg-surface]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[--border]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <ParkingCircle className="w-10 h-10 text-[--accent-blue]" />
          <div>
            <div className="text-lg font-display font-bold">ParkSmart</div>
            <div className="text-xs text-[--text-muted]">Urban Command Center</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink 
            to="/" 
            className="px-3 py-2 rounded-lg hover:bg-[--bg-elevated] transition text-[--text-muted] font-medium"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Driver
          </NavLink>
          <NavLink 
            to="/admin" 
            className="px-3 py-2 rounded-lg hover:bg-[--bg-elevated] transition text-[--text-muted] font-medium"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
