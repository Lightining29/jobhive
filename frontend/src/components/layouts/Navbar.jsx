import { Link, NavLink } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaBell,
  FaBars,
  FaXmark,
  FaHexagonNodes,
  FaArrowRightFromBracket,
  FaBookmark,
  FaBriefcase,
  FaShieldHalved,
  FaSun,
  FaMoon,
} from 'react-icons/fa6';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials, formatAvatarUrl } from '../../utils/format';

const NAV_LINKS = [
  { to: '/',            label: 'Home',        end: true  },
  { to: '/jobs',        label: 'Browse Jobs', end: false },
  { to: '/about',       label: 'About',       end: true  },
  { to: '/career-news', label: 'Career News', end: true  },
];

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'recruiter'
    ? '/recruiter/dashboard'
    : '/candidate/dashboard';

  const mobileMenu = (
    <div className="md:hidden absolute top-full inset-x-0 bg-white dark:bg-slate-900 shadow-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {user ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-3">
          <div className="flex items-center gap-3 mb-3">
            {user.avatar ? (
              <img
                src={formatAvatarUrl(user.avatar)}
                alt={user.name || ''}
                referrerPolicy="no-referrer"
                className="h-11 w-11 rounded-full object-cover border-2 border-primary-500 shrink-0 shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span className={`h-11 w-11 rounded-full bg-primary-600 text-white items-center justify-center text-sm font-bold shrink-0 shadow-sm ${user.avatar ? 'hidden' : 'flex'}`}>
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize font-medium">{user.role} • {user.email}</p>
            </div>
          </div>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="btn-primary w-full !py-2.5 text-xs font-bold justify-center shadow-sm flex items-center gap-1.5"
          >
            Enter Dashboard →
          </Link>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Appearance</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-amber-400 border border-slate-200 dark:border-slate-600 shadow-xs cursor-pointer"
        >
          {isDark ? <FaSun className="h-3.5 w-3.5 text-amber-400" /> : <FaMoon className="h-3.5 w-3.5 text-slate-600" />}
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">Navigation</p>
      {NAV_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}

      {user ? (
        <>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3">Quick Actions</p>
          <div className="space-y-1">
            <Link
              to="/jobs"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FaMagnifyingGlass className="h-4 w-4 text-primary-600 shrink-0" />
              Browse All Jobs
            </Link>
            {user.role === 'admin' ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-900 dark:text-white font-bold bg-amber-400/20 hover:bg-amber-400/30"
                >
                  <FaShieldHalved className="h-4 w-4 text-amber-600 shrink-0" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/services"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Services & Pricing
                </Link>
                <Link
                  to="/admin/plans"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Plans & Free Trials
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Users & Credits
                </Link>
                <Link
                  to="/admin/payments"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Billing & Payments
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/candidate/saved-jobs"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <FaBookmark className="h-4 w-4 text-primary-600 shrink-0" />
                  Saved Jobs
                </Link>
                {user.role === 'recruiter' && (
                  <Link
                    to="/recruiter/post-job"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <FaBriefcase className="h-4 w-4 text-primary-600 shrink-0" />
                    Post a Job
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold cursor-pointer"
            >
              <FaArrowRightFromBracket className="h-4 w-4" /> Logout
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-outline flex-1 text-center">Login</Link>
          <Link to="/auth/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center font-bold">Sign Up</Link>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="relative h-10 w-10 flex items-center justify-center bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 rounded-xl shadow-md border border-amber-300 group-hover:scale-105 transition-transform duration-300">
              <FaHexagonNodes className="h-5 w-5 text-slate-950" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Job Workplace
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                <span className="text-red-600">Apple</span>
                <span className="text-emerald-600">tree</span>{' '}
                <span className="text-slate-900 dark:text-slate-300 font-extrabold">infotech</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 bg-transparent">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth / Action area */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <FaSun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <FaMoon className="h-4.5 w-4.5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {user ? (
              <>
                <Link to="/jobs" className="btn-outline !py-2 text-xs">
                  <FaMagnifyingGlass className="h-3.5 w-3.5" /> Search
                </Link>

                {user.role === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-extrabold text-xs shadow-lift border border-amber-400/50 transition-all hover:scale-105"
                  >
                    <FaShieldHalved className="h-3.5 w-3.5 text-slate-900" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link to={dashboardPath} className="btn-primary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                    Dashboard
                  </Link>
                )}

                <Link to="/notifications" className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    aria-label="User menu"
                  >
                    {user.avatar ? (
                      <img
                        src={formatAvatarUrl(user.avatar)}
                        alt={user.name || ''}
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-full object-cover border-2 border-primary-500 transition-colors"
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <span className={`h-9 w-9 rounded-full bg-primary-600 text-white items-center justify-center text-sm font-bold shadow-sm ${user.avatar ? 'hidden' : 'flex'}`}>
                      {initials(user.name)}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 shadow-xl" onMouseLeave={() => setProfileOpen(false)}>
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">{user.role} Account</p>
                      </div>

                      {user.role === 'admin' ? (
                        <>
                          <Link to="/admin/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400/20 hover:bg-amber-400/30 transition-colors mb-1">
                            <FaShieldHalved className="h-3.5 w-3.5 text-amber-600" />
                            Admin Dashboard
                          </Link>
                          <Link to="/admin/services" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Services & Pricing</Link>
                          <Link to="/admin/plans" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Plans & Free Trials</Link>
                          <Link to="/admin/users" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Users & Credits</Link>
                          <Link to="/admin/payments" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Billing & Payments</Link>
                          <Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Platform Settings</Link>
                        </>
                      ) : (
                        <>
                          <Link to={dashboardPath} onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">Go to Dashboard</Link>
                          <Link to="/candidate/saved-jobs" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Saved Jobs</Link>
                          {user.role === 'recruiter' && (
                            <Link to="/recruiter/post-job" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Post a Job</Link>
                          )}
                        </>
                      )}

                      <Link to="/notifications" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Notifications</Link>
                      <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1 border-t border-slate-100 dark:border-slate-800 font-medium cursor-pointer">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="btn-outline !py-2 text-xs">
                  Login
                </Link>
                <Link to="/auth/register" className="btn-primary !py-2 text-xs">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle + Touch-to-Dashboard Avatar + Menu toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-amber-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDark ? <FaSun className="h-4 w-4 text-amber-400" /> : <FaMoon className="h-4 w-4 text-slate-600" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <FaBell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Link>
                {/* Touching this directly enters Dashboard on mobile */}
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-all shadow-xs"
                  title="Touch to enter Dashboard"
                >
                  {user.avatar ? (
                    <img
                      src={formatAvatarUrl(user.avatar)}
                      alt={user.name || ''}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full object-cover shrink-0 border border-primary-500"
                      onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span className={`h-7 w-7 rounded-full bg-primary-600 text-white items-center justify-center text-xs font-bold shrink-0 ${user.avatar ? 'hidden' : 'flex'}`}>
                    {initials(user.name)}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Dashboard</span>
                </Link>
              </>
            ) : (
              <Link to="/auth/login" className="btn-outline !py-1 !px-2.5 text-xs">
                Login
              </Link>
            )}

            <button
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <FaXmark className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && mobileMenu}
    </header>
  );
};

export default Navbar;
