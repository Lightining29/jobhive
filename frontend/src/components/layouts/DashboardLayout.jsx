import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBuilding, FaUser, FaShield } from 'react-icons/fa6';
import { initials } from '../../utils/format';

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
            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover border-2 border-accent/50" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accent-dark text-ink items-center justify-center font-bold text-lg shadow-sm ${user?.avatar ? 'hidden' : 'flex'}`}>
            {initials(user?.name)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-primary capitalize">
            <RoleIcon className="h-3 w-3" /> {user?.role}
          </span>
          <Link to="/" className="btn-outline !py-2 text-xs">Browse Jobs</Link>
          <button onClick={logout} className="btn-danger !py-2 text-xs">Logout</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {navItems?.length > 0 && (
          <aside className="lg:w-56 shrink-0">
            <nav className="card p-3 space-y-1 sticky top-20">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-accent text-ink shadow-sm'
                      : 'text-muted hover:bg-accent/10 hover:text-ink'
                  }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
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
