import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaBuilding, FaBriefcase, FaUsers, FaCalendarDays, FaGaugeHigh, FaPlus, FaUserTie, FaCircleCheck,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { recruiterService } from '../../services';
import { STATUS_COLORS, capitalize, formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/recruiter/dashboard', label: 'Overview', icon: FaGaugeHigh, end: true },
  { to: '/recruiter/company', label: 'Company Profile', icon: FaBuilding },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: FaPlus },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: FaBriefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: FaUsers },
];

const RecruiterDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: d } = await recruiterService.dashboard();
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

  const stats = [
    { label: 'Total Jobs', value: data?.stats?.totalJobs ?? 0, icon: FaBriefcase, to: '/recruiter/my-jobs' },
    { label: 'Active Jobs', value: data?.stats?.activeJobs ?? 0, icon: FaCircleCheck, to: '/recruiter/my-jobs' },
    { label: 'Applicants', value: data?.stats?.applicants ?? 0, icon: FaUsers, to: '/recruiter/applications' },
    { label: 'Interviews', value: data?.stats?.interviews ?? 0, icon: FaCalendarDays, to: '/recruiter/applications' },
  ];

  return (
    <DashboardLayout title="Recruiter Dashboard" subtitle="Manage your company, jobs, and applicants" navItems={navItems}>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-28" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Link key={s.label} to={s.to} className="card card-hover p-5">
                <span className="h-11 w-11 rounded-xl bg-accent/15 flex items-center justify-center text-ink mb-3">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </Link>
            ))}
          </div>

          {!data?.company && (
            <div className="card p-6 bg-accent/10 border-accent/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg">Register your company</p>
                <p className="text-sm text-muted">You need a company profile before posting jobs.</p>
              </div>
              <Link to="/recruiter/company" className="btn-primary">Register Company</Link>
            </div>
          )}

          {data?.company && (
            <div className="card p-5 flex flex-wrap items-center gap-4">
              <span className="h-14 w-14 rounded-2xl bg-accent/15 flex items-center justify-center text-ink">
                <FaBuilding className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-lg flex items-center gap-2">
                  {data.company.name}
                  {data.company.verified ? (
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200"><FaCircleCheck className="h-3 w-3" /> Verified</span>
                  ) : (
                    <span className="badge bg-orange-50 text-orange-700 border border-orange-200">Pending verification</span>
                  )}
                </p>
                <p className="text-sm text-muted">{data.company.industry || 'No industry'} • {data.company.headquarters || 'No location'}</p>
              </div>
              <Link to="/recruiter/company" className="btn-outline">Edit</Link>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Recent Applications</h2>
              <Link to="/recruiter/applications" className="text-sm font-semibold text-ink hover:underline">View all</Link>
            </div>
            <div className="card overflow-hidden">
              {data?.recentApplications?.length ? (
                <div className="divide-y divide-line">
                  {data.recentApplications.map((app) => (
                    <div key={app._id} className="p-4 flex flex-wrap items-center gap-3">
                      <span className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-ink font-bold text-sm">
                        <FaUserTie className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{app.job?.jobTitle}</p>
                        <p className="text-xs text-muted">Applied {formatDateTime(app.createdAt)}</p>
                      </div>
                      <span className={`badge border ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>{capitalize(app.status)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted">No applications yet. Applications will appear here once candidates apply.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecruiterDashboardPage;
