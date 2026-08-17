import { Link, NavLink } from 'react-router-dom';
import { FaMagnifyingGlass, FaBell, FaBars, FaXmark, FaHexagonNodes, FaArrowRightFromBracket, FaBookmark, FaGlobe, FaBriefcase, FaShieldHalved, FaBolt } from 'react-icons/fa6';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials } from '../../utils/format';

const NAV_LINKS = [
  { to: '/jobs',         label: 'Browse Jobs',    end: false },
  { to: '/jobs/technical',     label: 'Technical',      end: false },
  { to: '/jobs/non-technical', label: 'Non-Technical',  end: false },
  { to: '/jobs/remote',        label: 'Remote',         end: false },
  { to: '/career-news',        label: 'Career News',    end: true  },
];

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const { isNeon, toggleNeon } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';

  const mobileMenu = (
    <div className="md:hidden absolute top-full inset-x-0 bg-white shadow-lift border-b border-line px-4 py-4 space-y-2 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {user ? (
        <div className="p-3 bg-gradient-to-br from-slate-50 to-primary-50/40 rounded-2xl border border-line mb-3">
          <div className="flex items-center gap-3 mb-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-11 w-11 rounded-full object-cover border-2 border-accent shrink-0"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span className={`h-11 w-11 rounded-full bg-gradient-to-br from-accent-dark to-ink text-white items-center justify-center text-sm font-bold shrink-0 ${user.avatar ? 'hidden' : 'flex'}`}>
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink truncate">{user.name}</p>
              <p className="text-xs text-muted truncate capitalize">{user.role} • {user.email}</p>
            </div>
          </div>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="btn-primary w-full !py-2.5 text-xs font-bold justify-center shadow-sm"
          >
            Enter Dashboard →
          </Link>
        </div>
      ) : null}

      <p className="text-[11px] font-bold text-muted uppercase tracking-wider px-3 pt-1">Navigation</p>
      {NAV_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `block px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? isNeon
                  ? 'bg-cyan-500/25 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.7)] font-bold'
                  : 'bg-accent/10 text-ink font-semibold'
                : isNeon
                  ? 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-white'
                  : 'text-muted hover:bg-slate-50 hover:text-ink'
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}

      {user ? (
        <div className="pt-3 border-t border-line space-y-1">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider px-3">Account</p>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-accent/10 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Dashboard
          </Link>
          <Link
            to="/candidate/saved-jobs"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors"
          >
            <FaBookmark className="h-3.5 w-3.5 text-muted" />
            Saved Jobs
          </Link>
          {user.role === 'recruiter' && (
            <Link
              to="/recruiter/post-job"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors"
            >
              <FaBriefcase className="h-3.5 w-3.5 text-muted" />
              Post a Job
            </Link>
          )}
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <FaBell className="h-3.5 w-3.5 text-muted" />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="badge badge-accent !px-2 !py-0.5 text-[10px]">
                {unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-sm text-red-600 font-medium hover:bg-red-50 transition-colors mt-2"
          >
            <FaArrowRightFromBracket className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-line">
          <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-outline flex-1">Login</Link>
          <Link to="/auth/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Sign Up</Link>
        </div>
      )}
    </div>
  );

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isNeon
        ? 'bg-[#03060a]/20 backdrop-blur-md border-b border-cyan-400/60 shadow-[0_4px_30px_rgba(0,240,255,0.3)]'
        : 'glass border-b border-line/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="relative h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FaHexagonNodes className={`h-10 w-10 ${isNeon ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]' : 'text-ink drop-shadow-sm'}`} />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className={`h-4 w-4 rounded-full ${isNeon ? 'bg-pink-500 shadow-[0_0_15px_rgba(255,0,127,0.9)] animate-pulse' : 'bg-accent shadow-[0_0_12px_rgba(250,204,21,0.5)]'}`} />
              </span>
            </span>
            <div className="flex flex-col leading-tight">
              <span className={`text-lg sm:text-xl font-black tracking-tight ${isNeon ? 'text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]' : 'text-ink'}`}>
                Job Workplace
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                <span className={isNeon ? 'text-red-400 drop-shadow-[0_0_8px_rgba(255,50,50,0.9)]' : 'text-red-600'}>Apple</span>
                <span className={isNeon ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(50,255,150,0.9)]' : 'text-emerald-600'}>tree</span>{' '}
                <span className={isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)] font-extrabold' : 'text-black'}>infotech</span>
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
                      ? isNeon
                        ? 'bg-cyan-500/20 text-white border border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.75)] drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]'
                        : 'bg-accent/15 text-ink shadow-sm font-bold'
                      : isNeon
                        ? 'text-cyan-100/70 hover:text-white hover:bg-cyan-500/10 hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                        : 'text-muted hover:bg-slate-50 hover:text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth / Action area */}
          <div className="hidden md:flex items-center gap-3">
            {/* ⚡ Neon Mode Switcher Button */}
            <button
              type="button"
              onClick={toggleNeon}
              className={`group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-300 shadow-sm cursor-pointer ${
                isNeon
                  ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_22px_rgba(255,42,133,0.85)] border border-pink-300 scale-105 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
              title={isNeon ? 'Switch to Normal Mode' : 'Turn ON Neon Website Mode'}
            >
              <FaBolt className={`h-3.5 w-3.5 transition-transform duration-300 ${isNeon ? 'text-yellow-300' : 'text-amber-500 group-hover:scale-125'}`} />
              <span className="tracking-wider">{isNeon ? '⚡ NEON ON' : '⚡ NEON MODE'}</span>
            </button>

            {user ? (
              <>
                <Link to="/jobs" className="btn-outline !py-2">
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
                  <Link to={dashboardPath} className="btn-primary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    Dashboard
                  </Link>
                )}

                <Link to="/notifications" className="relative p-2 rounded-xl text-muted hover:bg-slate-50 hover:text-ink transition-colors">
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
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors group"
                    aria-label="User menu"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover border-2 border-accent group-hover:border-accent-dark transition-colors" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span className={`h-9 w-9 rounded-full bg-gradient-to-br from-accent-dark to-ink text-white items-center justify-center text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow ${user.avatar ? 'hidden' : 'flex'}`}>
                      {initials(user.name)}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-60 card p-2 z-50 shadow-lift" onMouseLeave={() => setProfileOpen(false)}>
                      <div className="px-3 py-2 border-b border-line mb-1">
                        <p className="text-sm font-bold truncate text-ink">{user.name}</p>
                        <p className="text-xs text-muted capitalize font-medium">{user.role} Account</p>
                      </div>

                      {user.role === 'admin' ? (
                        <>
                          <Link to="/admin/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400/20 hover:bg-amber-400/30 transition-colors mb-1">
                            <FaShieldHalved className="h-3.5 w-3.5 text-amber-600" />
                            Admin Dashboard
                          </Link>
                          <Link to="/admin/services" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-muted hover:bg-slate-50 hover:text-ink transition-colors">Services & Pricing</Link>
                          <Link to="/admin/plans" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-muted hover:bg-slate-50 hover:text-ink transition-colors">Plans & Free Trials</Link>
                          <Link to="/admin/users" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-muted hover:bg-slate-50 hover:text-ink transition-colors">Users & Credits</Link>
                          <Link to="/admin/payments" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-muted hover:bg-slate-50 hover:text-ink transition-colors">Billing & Payments</Link>
                          <Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 rounded-xl text-xs text-muted hover:bg-slate-50 hover:text-ink transition-colors">Platform Settings</Link>
                        </>
                      ) : (
                        <>
                          <Link to={dashboardPath} onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-ink bg-accent/10 hover:bg-accent/20 transition-colors">Go to Dashboard</Link>
                          <Link to="/candidate/saved-jobs" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors">Saved Jobs</Link>
                          {user.role === 'recruiter' && (
                            <Link to="/recruiter/post-job" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors">Post a Job</Link>
                          )}
                        </>
                      )}

                      <Link to="/notifications" onClick={() => setProfileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-slate-50 hover:text-ink transition-colors">Notifications</Link>
                      <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-line font-medium">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={
                    isNeon
                      ? 'px-4 py-2 rounded-xl text-xs font-black text-cyan-200 border-1.5 border-cyan-400 bg-slate-950/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-cyan-500/20 hover:text-white hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] transition-all cursor-pointer'
                      : 'btn-outline !py-2 text-xs'
                  }
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className={
                    isNeon
                      ? 'px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 border border-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.85)] hover:shadow-[0_0_35px_rgba(0,240,255,1)] hover:scale-105 transition-all cursor-pointer'
                      : 'btn-primary !py-2 text-xs'
                  }
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Touch-to-Dashboard Avatar + Menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleNeon}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                isNeon
                  ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.9)] scale-105'
                  : 'bg-slate-100 text-slate-700'
              }`}
              title="Toggle Neon Mode"
            >
              <FaBolt className="h-3.5 w-3.5" />
            </button>

            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-1.5 rounded-lg text-muted hover:text-ink transition-colors"
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
                  className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-slate-100 active:bg-slate-200 border border-slate-200 transition-all shadow-xs"
                  title="Touch to enter Dashboard"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover border border-accent shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span className={`h-7 w-7 rounded-full bg-gradient-to-br from-accent-dark to-ink text-white items-center justify-center text-xs font-bold shrink-0 ${user.avatar ? 'hidden' : 'flex'}`}>
                    {initials(user.name)}
                  </span>
                  <span className="text-xs font-bold text-ink">Dashboard</span>
                </Link>
              </>
            ) : (
              <Link to="/auth/login" className="btn-outline !py-1 !px-2.5 text-xs">
                Login
              </Link>
            )}

            <button
              className="p-2 rounded-xl text-ink hover:bg-slate-50 transition-colors"
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

