import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaFlag,
  FaCreditCard,
  FaTicket,
  FaGem,
  FaClock,
  FaArrowTrendUp,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaChartPie,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency, formatDateTime } from '../../utils/format';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: d } = await adminService.dashboard();
      setData(d);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats || {};

  const mainCards = [
    { label: 'Total Candidates', value: stats.candidates || 0, icon: FaUsers, color: 'text-blue-500 bg-blue-500/10', to: '/admin/users?role=candidate' },
    { label: 'Total Employers', value: stats.recruiters || 0, icon: FaBuilding, color: 'text-purple-500 bg-purple-500/10', to: '/admin/users?role=recruiter' },
    { label: 'Active Jobs', value: stats.activeJobs || 0, icon: FaBriefcase, color: 'text-emerald-500 bg-emerald-500/10', to: '/admin/jobs' },
    { label: 'Pending Jobs', value: stats.pendingJobs || 0, icon: FaClock, color: 'text-amber-500 bg-amber-500/10', to: '/admin/jobs' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions || 0, icon: FaGem, color: 'text-indigo-500 bg-indigo-500/10', to: '/admin/plans' },
    { label: 'Free-Trial Users', value: stats.trialUsers || 0, icon: FaClock, color: 'text-cyan-500 bg-cyan-500/10', to: '/admin/users' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue || 0), icon: FaDollarSign, color: 'text-emerald-600 bg-emerald-500/10', to: '/admin/payments' },
    { label: 'Coupon Usage', value: stats.couponUsage || 0, icon: FaTicket, color: 'text-pink-500 bg-pink-500/10', to: '/admin/coupons' },
  ];

  const maxCategory = Math.max(...Object.values(stats.jobsByCategory || {}), 1);

  return (
    <DashboardLayout title="Admin Control Center" subtitle="Comprehensive platform management and monetization overview" navItems={adminNavItems}>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mainCards.map((c) => (
              <Link key={c.label} to={c.to} className="card p-5 hover:border-primary-500/40 transition-all group flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">{c.label}</span>
                  <div className={`p-2.5 rounded-xl ${c.color}`}>
                    <c.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black mt-2 group-hover:text-primary-600 transition-colors">
                  {c.value}
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions Bar */}
          <div className="card p-5 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border-primary-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Platform Quick Controls</h3>
              <p className="text-sm text-muted">Create services, launch promotions, grant trial extensions or moderate jobs</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/admin/services" className="btn-primary !py-2 !px-3.5 text-xs font-semibold">
                + Add Service
              </Link>
              <Link to="/admin/plans" className="btn-outline !py-2 !px-3.5 text-xs font-semibold">
                + Create Plan
              </Link>
              <Link to="/admin/coupons" className="btn-outline !py-2 !px-3.5 text-xs font-semibold">
                + New Coupon
              </Link>
              <Link to="/admin/bundles" className="btn-outline !py-2 !px-3.5 text-xs font-semibold">
                + Package Deal
              </Link>
            </div>
          </div>

          {/* Grid: Charts and Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FaBriefcase className="text-primary-500" /> Jobs by Category
                </h2>
                <span className="text-xs font-semibold text-muted">{stats.totalJobs || 0} total</span>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.jobsByCategory || {}).map(([cat, count]) => {
                  const pct = Math.round((count / maxCategory) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize">{cat}</span>
                        <span className="text-muted font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-line/60 rounded-full h-2 overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Source Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FaChartPie className="text-primary-500" /> Jobs by Career Ingestion Source
                </h2>
                <span className="text-xs font-semibold text-muted">All Providers</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(stats.jobsBySource || {}).map(([src, count]) => (
                  <div key={src} className="p-3 rounded-xl bg-surface-sunken/40 border border-line flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize">{src}</span>
                    <span className="text-xs font-bold text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Tables: Recent Transactions & New Registrations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FaFileInvoiceDollar className="text-emerald-500" /> Recent Payments
                </h2>
                <Link to="/admin/payments" className="text-xs font-semibold text-primary-600 hover:underline">
                  View All &rarr;
                </Link>
              </div>
              {data?.recentPayments?.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">No payment transactions recorded yet.</p>
              ) : (
                <div className="divide-y divide-line">
                  {data?.recentPayments?.map((tx) => (
                    <div key={tx._id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-semibold text-ink">{tx.user?.name || 'Direct Customer'}</div>
                        <div className="text-xs text-muted capitalize">{tx.type} • {tx.paymentMethod}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">{formatCurrency(tx.totalAmount, tx.currency)}</div>
                        <div className="text-[11px] text-muted">{formatDateTime(tx.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FaUsers className="text-blue-500" /> New Registrations
                </h2>
                <Link to="/admin/users" className="text-xs font-semibold text-primary-600 hover:underline">
                  View All &rarr;
                </Link>
              </div>
              <div className="divide-y divide-line">
                {data?.recentUsers?.map((u) => (
                  <div key={u._id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-ink">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className={`badge text-[11px] ${u.role === 'recruiter' ? 'badge-primary' : 'badge-neutral'} capitalize`}>
                        {u.role}
                      </span>
                      <div className="text-[11px] text-muted mt-0.5">{formatDateTime(u.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
