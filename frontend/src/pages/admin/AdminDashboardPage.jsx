import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUsers, FaBuilding, FaBriefcase, FaFlag, FaShield, FaGaugeHigh, FaFileCircleCheck, FaUserXmark, FaChartPie,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminService } from '../../services';
import { capitalize, formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaGaugeHigh, end: true },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/companies', label: 'Companies', icon: FaBuilding },
  { to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FaFlag },
];

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: d } = await adminService.dashboard();
      setData(d);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats || {};
  const cards = [
    { label: 'Total Users', value: stats.users, icon: FaUsers, to: '/admin/users' },
    { label: 'Candidates', value: stats.candidates, icon: FaUserXmark, to: '/admin/users?role=candidate' },
    { label: 'Recruiters', value: stats.recruiters, icon: FaUsers, to: '/admin/users?role=recruiter' },
    { label: 'Companies', value: stats.companies, icon: FaBuilding, to: '/admin/companies' },
    { label: 'Jobs', value: stats.jobs, icon: FaBriefcase, to: '/admin/jobs' },
    { label: 'Applications', value: stats.applications, icon: FaFileCircleCheck, to: '/admin/jobs' },
    { label: 'Open Reports', value: stats.openReports, icon: FaFlag, to: '/admin/reports' },
    { label: 'Jobs Today', value: stats.jobsToday, icon: FaChartPie, to: '/admin/jobs' },
  ];

  const maxCategory = Math.max(...Object.values(stats.jobsByCategory || {}), 1);

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform analytics and moderation" navItems={navItems}>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card p-5 skeleton h-28" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="card card-hover p-5">
                <span className="h-11 w-11 rounded-xl bg-accent/15 flex items-center justify-center text-ink mb-3">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="text-2xl font-extrabold">{c.value ?? 0}</p>
                <p className="text-sm text-muted">{c.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-bold mb-4">Jobs by Category</h3>
              {Object.keys(stats.jobsByCategory || {}).length === 0 ? (
                <p className="text-sm text-muted">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.jobsByCategory).map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{cat}</span><span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(count / maxCategory) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-5">
              <h3 className="font-bold mb-4">Applications by Status</h3>
              <div className="space-y-2">
                {Object.entries(stats.applicationsByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.applicationsByStatus || {}).length === 0 && <p className="text-sm text-muted">No data yet</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <h3 className="font-bold">Recent Users</h3>
                <Link to="/admin/users" className="text-sm text-ink font-semibold hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-line">
                {(data?.recentUsers || []).map((u) => (
                  <div key={u._id} className="p-3 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-ink text-xs font-bold">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                    <span className="badge bg-gray-100 text-muted border border-line capitalize">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <h3 className="font-bold">Open Reports</h3>
                <Link to="/admin/reports" className="text-sm text-ink font-semibold hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-line">
                {(data?.recentReports || []).map((r) => (
                  <div key={r._id} className="p-3">
                    <p className="text-sm font-semibold">{r.reason}</p>
                    <p className="text-xs text-muted mt-0.5">Type: {r.type} • {formatDateTime(r.createdAt)}</p>
                  </div>
                ))}
                {(data?.recentReports || []).length === 0 && <p className="p-4 text-sm text-muted">No open reports.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
