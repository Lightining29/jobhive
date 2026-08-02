import { Link, NavLink } from 'react-router-dom';
import { FaMagnifyingGlass, FaBell, FaBars, FaXmark } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';

  const mobileMenu = (
    <div className="md:hidden absolute top-full inset-x-0 bg-white shadow-lift border-b border-line px-4 py-4 space-y-2 z-50">
      {NAV_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-accent/10 text-ink' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>
          {l.label}
        </NavLink>
      ))}
      {!user && (
        <div className="flex gap-2 pt-3 border-t border-line">
          <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-outline flex-1">Login</Link>
          <Link to="/auth/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Sign Up</Link>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 glass border-b border-line/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="relative h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FaHexagonNodes className="h-10 w-10 text-ink drop-shadow-sm" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-4 w-4 rounded-full bg-accent shadow-[0_0_12px_rgba(250,204,21,0.5)]" />
              </span>
            </span>
            <span className="text-xl font-black tracking-tight text-ink">
              Job<span className="bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">Hive</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-accent/10 text-ink shadow-sm' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/jobs" className="btn-outline !py-2">
                  <FaMagnifyingGlass className="h-3.5 w-3.5" /> Search
                </Link>
                <Link to="/notifications" className="relative p-2 rounded-xl text-muted hover:bg-slate-50 hover:text-ink transition-colors">
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen((p) => !p)} className="flex items-center gap-2 group">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover border-2 border-accent group-hover:border-accent-dark transition-colors" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span className={`h-9 w-9 rounded-full bg-gradient-to-br from-accent-dark to-ink text-white items-center justify-center text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow ${user.avatar ? 'hidden' : 'flex'}`}>
                      {initials(user.name)}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 card p-2 z-50" onMouseLeave={() => setProfileOpen(false)}>
                      <div className="px-3 py-2 border-b border-line mb-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted capitalize">{user.role}</p>
                      </div>
                      <Link to={dashboardPath} className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">Dashboard</Link>
                      <Link to="/candidate/saved-jobs" className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">Saved Jobs</Link>
                      <Link to="/candidate/portfolio" className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">AI Portfolio</Link>
                      {user.role === 'candidate' && (
                        <Link to="/candidate/deployment" className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">My Portfolio</Link>
                      )}
                      <Link to="/notifications" className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">Notifications</Link>
                      {user.role === 'recruiter' && (
                        <Link to="/recruiter/post-job" className="block px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent/10 hover:text-ink transition-colors">Post a Job</Link>
                      )}
                      <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="btn-outline">Login</Link>
                <Link to="/auth/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl text-ink hover:bg-slate-50 transition-colors" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <FaXmark className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && mobileMenu}
    </header>
  );
};

export default Navbar;
