import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';
import { FaBuilding, FaUser, FaShield, FaFire } from 'react-icons/fa6';
import { initials, formatAvatarUrl } from '../../utils/format';

const DashboardLayout = ({ title, subtitle, navItems, children }) => {
  const { user, logout } = useAuth();

  const roleIcon = {
    candidate: FaUser,
    recruiter: FaBuilding,
    admin: FaShield,
  }[user?.role] || FaUser;

  const RoleIcon = roleIcon;

  return (
    <div className="min-h-screen w-full relative bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* ── 1. Full-Screen Outer Neon Laser Border (Dark Mode Only) ── */}
      <div className="hidden dark:block fixed inset-2 sm:inset-3 pointer-events-none rounded-[28px] sm:rounded-[36px] border-2 border-[#ff2d87]/60 shadow-[0_0_25px_rgba(255,45,135,0.4),inset_0_0_20px_rgba(0,240,255,0.2)] z-30 opacity-80" />

      {/* ── 2. Ambient Neon Lighting Pools ─────────────────────────── */}
      <div className="hidden dark:block absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden dark:block absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        
        {/* ── Dashboard Top Header with Neon Avatar & Badges ───────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#080C1B]/90 border border-slate-200 dark:border-pink-500/50 shadow-md dark:shadow-[0_0_25px_rgba(255,45,135,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-4 min-w-0">
            {user?.avatar ? (
              <img
                src={formatAvatarUrl(user.avatar)}
                alt={user.name || ''}
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-full object-cover border-2 border-primary-500 dark:neon-avatar-ring-pink shadow-md shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-14 w-14 rounded-full bg-primary-600 dark:bg-gradient-to-tr dark:from-pink-500 dark:to-cyan-400 text-white items-center justify-center font-black text-xl shadow-md dark:neon-avatar-ring-pink shrink-0 ${user?.avatar ? 'hidden' : 'flex'}`}>
              {initials(user?.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:neon-text-pink truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-pink-300/80 font-semibold mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="capitalize font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 bg-primary-50 text-primary-700 dark:neon-badge-yellow shadow-xs">
              <RoleIcon className="h-3.5 w-3.5" /> {user?.role}
            </span>
            <Link
              to="/jobs"
              className="btn-outline dark:bg-[#12162a] dark:text-cyan-300 dark:border-cyan-500/50 dark:hover:neon-badge-cyan !py-2 text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Browse Jobs
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-xs font-black rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:text-white dark:shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all cursor-pointer hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── Main Layout: Sidebar & Content Area ─────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {navItems?.length > 0 && (
            <aside className="lg:w-60 shrink-0">
              <nav className="p-3.5 space-y-1.5 sticky top-24 rounded-[24px] bg-white dark:bg-[#080C1B]/90 border border-slate-200 dark:border-cyan-500/40 shadow-lg dark:shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-cyan-400 px-3 py-1">
                  Dashboard Hub
                </p>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:neon-playing-card-pink dark:!border-[#ff2d87] shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#12162a] dark:hover:text-cyan-300'
                      }`
                    }
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </aside>
          )}

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
