import { useAuth } from '../../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';
import { FaBuilding, FaUser, FaShield } from 'react-icons/fa6';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={formatAvatarUrl(user.avatar)}
              alt={user.name || ''}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full object-cover border-2 border-primary-500 shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`h-12 w-12 rounded-full bg-primary-600 text-white items-center justify-center font-bold text-lg shadow-sm ${user?.avatar ? 'hidden' : 'flex'}`}>
            {initials(user?.name)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="capitalize font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200">
            <RoleIcon className="h-3 w-3" /> {user?.role}
          </span>
          <Link to="/" className="btn-outline !py-2 text-xs">Browse Jobs</Link>
          <button onClick={logout} className="btn-danger !py-2 text-xs">Logout</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {navItems?.length > 0 && (
          <aside className="lg:w-56 shrink-0">
            <nav className="p-3 space-y-1.5 sticky top-20 rounded-2xl bg-white border border-slate-200 shadow-xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
