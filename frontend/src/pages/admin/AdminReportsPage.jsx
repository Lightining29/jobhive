import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBuilding, FaBriefcase, FaFlag, FaGaugeHigh, FaCircleCheck, FaBan } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminService } from '../../services';
import { formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/companies', label: 'Companies', icon: FaBuilding },
  { to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FaFlag },
];

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('open');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.reports({ page: 1, limit: 50, status: status || undefined });
      setReports(data.reports);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (report, action) => {
    if (!window.confirm(`Mark this report as ${action}?`)) return;
    try {
      await adminService.resolveReport(report._id, action, `${action} by admin`);
      toast.success(`Report ${action}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Reports" subtitle="Moderate user reports" navItems={navItems}>
      <div className="flex gap-2 mb-5">
        {['open', 'resolved', 'dismissed'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`badge py-1.5 px-3 cursor-pointer border capitalize ${status === s ? 'bg-accent text-ink border-accent' : 'bg-white text-muted border-line hover:border-accent'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-24" />)}</div>
      ) : reports.length === 0 ? (
        <div className="card p-10 text-center text-muted"><FaFlag className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p>No {status} reports.</p></div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-primary-50 text-yellow-800 border border-accent">{r.type}</span>
                    <span className="badge bg-gray-100 text-muted border border-line capitalize">{r.status}</span>
                    <span className="text-xs text-muted">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <p className="font-semibold mt-2">{r.reason}</p>
                  {r.details && <p className="text-sm text-muted mt-1">{r.details}</p>}
                  {r.reportedBy && <p className="text-xs text-gray-400 mt-2">Reported by: {r.reportedBy.name} ({r.reportedBy.email})</p>}
                </div>
                {r.status === 'open' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resolve(r, 'resolved')} className="btn-outline !py-2 text-xs !border-emerald-300 !text-emerald-700 hover:!bg-emerald-50">
                      <FaCircleCheck className="h-3.5 w-3.5" /> Resolve
                    </button>
                    <button onClick={() => resolve(r, 'dismissed')} className="btn-danger !py-2 text-xs">
                      <FaBan className="h-3.5 w-3.5" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
              {r.resolution && <p className="text-xs text-muted mt-2 border-t border-line pt-2">Resolution: {r.resolution}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReportsPage;
