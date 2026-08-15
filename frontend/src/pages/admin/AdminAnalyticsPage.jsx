import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaChartLine,
  FaFileCsv,
  FaDollarSign,
  FaUsers,
  FaGem,
  FaClock,
  FaArrowTrendUp,
  FaTicket,
  FaBriefcase,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/format';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await adminService.analytics();
      setData(res.analytics);
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = (type) => {
    window.open(`/api/admin/reports/export?type=${type}`, '_blank');
  };

  const a = data || {};
  const maxMonthly = Math.max(...(a.revenueByMonth?.map((r) => r.revenue) || [1]), 1);

  return (
    <DashboardLayout title="Financial & Growth Analytics" subtitle="Monthly Recurring Revenue (MRR), free trial conversion rates, and exportable reports" navItems={adminNavItems}>
      <div className="space-y-8">
        {/* Top Export Toolbar */}
        <div className="card p-5 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border-primary-500/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Export Financial & Portal Data</h3>
            <p className="text-sm text-muted">Download complete CSV reports for accounting, auditing, and marketing</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => handleExport('revenue')} className="btn-outline !py-2 !px-3.5 text-xs font-semibold gap-1.5 rounded-xl">
              <FaFileCsv className="text-emerald-600" /> Revenue CSV
            </button>
            <button onClick={() => handleExport('users')} className="btn-outline !py-2 !px-3.5 text-xs font-semibold gap-1.5 rounded-xl">
              <FaFileCsv className="text-blue-600" /> Users & Plans CSV
            </button>
            <button onClick={() => handleExport('jobs')} className="btn-outline !py-2 !px-3.5 text-xs font-semibold gap-1.5 rounded-xl">
              <FaFileCsv className="text-purple-600" /> Jobs Inventory CSV
            </button>
          </div>
        </div>

        {/* Core KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-emerald-500">
            <span className="text-xs font-semibold uppercase text-muted">Monthly Recurring Revenue (MRR)</span>
            <div className="text-3xl font-black mt-1 text-emerald-600">{formatCurrency(a.mrr || 0)}</div>
            <div className="text-[11px] text-muted mt-1">Based on active subscription tiers</div>
          </div>

          <div className="card p-5 border-l-4 border-cyan-500">
            <span className="text-xs font-semibold uppercase text-muted">Active Trial Users</span>
            <div className="text-3xl font-black mt-1 text-cyan-600">{a.trialUsersCount || 0} companies</div>
            <div className="text-[11px] text-muted mt-1">Currently evaluating premium plans</div>
          </div>

          <div className="card p-5 border-l-4 border-indigo-500">
            <span className="text-xs font-semibold uppercase text-muted">Active Paid Subscriptions</span>
            <div className="text-3xl font-black mt-1 text-indigo-600">{a.activePaidSubscriptionsCount || 0} clients</div>
            <div className="text-[11px] text-muted mt-1">Paying monthly/annual accounts</div>
          </div>

          <div className="card p-5 border-l-4 border-pink-500">
            <span className="text-xs font-semibold uppercase text-muted">Trial-to-Paid Conversion</span>
            <div className="text-3xl font-black mt-1 text-pink-600">{a.trialToPaidConversion || 0}%</div>
            <div className="text-[11px] text-muted mt-1">Lifetime trial conversion rate</div>
          </div>
        </div>

        {/* Monthly Revenue Trend Visualizer */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FaArrowTrendUp className="text-emerald-500" /> 6-Month Revenue Trend
          </h2>
          {a.revenueByMonth?.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No historical revenue data recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {a.revenueByMonth?.map((m) => {
                const pct = Math.round((m.revenue / maxMonthly) * 100);
                return (
                  <div key={m._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="font-mono text-ink font-bold">{m._id}</span>
                      <span className="text-emerald-600 font-extrabold">{formatCurrency(m.revenue)} ({m.count} orders)</span>
                    </div>
                    <div className="w-full bg-line/60 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Services & Coupon ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaGem className="text-primary-500" /> Top Selling Services
            </h2>
            {a.topServicesPurchased?.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No service purchases recorded.</p>
            ) : (
              <div className="divide-y divide-line">
                {a.topServicesPurchased?.map((s, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold text-ink">Service Package #{i + 1}</div>
                      <div className="text-xs text-muted">{s.count} total purchases</div>
                    </div>
                    <div className="font-bold text-emerald-600">{formatCurrency(s.totalSales)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Coupons */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaTicket className="text-pink-500" /> Most Effective Coupon Campaigns
            </h2>
            {a.topCouponsUsed?.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No coupons redeemed yet.</p>
            ) : (
              <div className="divide-y divide-line">
                {a.topCouponsUsed?.map((c) => (
                  <div key={c._id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono font-bold text-primary-600">{c.code}</span>
                      <div className="text-xs text-muted">{c.name} • {c.timesUsed} redemptions</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-bold text-blue-600">Rev: {formatCurrency(c.revenueGenerated || 0)}</div>
                      <div className="text-muted">Disc: {formatCurrency(c.totalDiscountGiven || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
