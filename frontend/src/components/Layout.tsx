import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/bots', label: 'Bots', icon: IconBot },
  { to: '/orders', label: 'Orders', icon: IconList },
  { to: '/exchange-keys', label: 'API Keys', icon: IconKey },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-base text-text">
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-border">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-semibold tracking-tight">CryptoBot</span>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                  isActive
                    ? 'bg-surface-raised text-accent'
                    : 'text-muted hover:text-text hover:bg-surface'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border text-xs text-muted">
          Paper &amp; live trading supported
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 gap-4">
          <div className="flex-1 max-w-sm">
            <input
              placeholder="Search symbol, bot…"
              className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-muted">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="text-sm text-muted hover:text-sell border border-border rounded-md px-3 py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconBot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="4" y="7" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 7V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="3" r="1" fill="currentColor" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="12.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 5h12M4 10h12M4 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="7" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.2 10.8 15 5l1.5 1.5M13 7.5 14.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
