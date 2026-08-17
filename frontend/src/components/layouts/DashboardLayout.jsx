import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, NavLink } from 'react-router-dom';
import { FaBuilding, FaUser, FaShield, FaBolt } from 'react-icons/fa6';
import { initials, formatAvatarUrl } from '../../utils/format';

const DashboardLayout = ({ title, subtitle, navItems, children }) => {
  const { user, logout } = useAuth();
  const { isNeon } = useTheme();

  const roleIcon = {
    candidate: FaUser,
    recruiter: FaBuilding,
    admin: FaShield,
  }[user?.role] || FaUser;

  const RoleIcon = roleIcon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={formatAvatarUrl(user.avatar)}
              alt={user.name || ''}
              className={`h-12 w-12 rounded-full object-cover border-2 ${isNeon ? 'border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.7)]' : 'border-accent/50'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`h-12 w-12 rounded-full items-center justify-center font-bold text-lg shadow-sm ${user?.avatar ? 'hidden' : 'flex'} ${
            isNeon ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.7)]' : 'bg-gradient-to-br from-accent to-accent-dark text-ink'
          }`}>
            {initials(user?.name)}
          </div>
          <div>
            <h1 className={`text-2xl font-black ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]' : 'text-ink'}`}>{title}</h1>
            {subtitle && <p className={`text-sm ${isNeon ? 'text-cyan-200/70' : 'text-muted'}`}>{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`capitalize font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            isNeon ? 'bg-cyan-950/60 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'badge-primary'
          }`}>
            <RoleIcon className="h-3 w-3" /> {user?.role}
          </span>
          <Link to="/" className="btn-outline !py-2 text-xs">Browse Jobs</Link>
          <button onClick={logout} className="btn-danger !py-2 text-xs">Logout</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {navItems?.length > 0 && (
          <aside className="lg:w-56 shrink-0">
            <nav className={`p-3 space-y-1.5 sticky top-20 rounded-2xl border transition-all ${
              isNeon
                ? 'bg-slate-900/60 backdrop-blur-xl border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                : 'card'
            }`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? isNeon
                          ? 'bg-cyan-500/25 text-white border border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.7)] drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]'
                          : 'bg-accent text-ink shadow-sm font-bold'
                        : isNeon
                          ? 'text-cyan-200/70 hover:bg-cyan-500/10 hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]'
                          : 'text-muted hover:bg-accent/10 hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
