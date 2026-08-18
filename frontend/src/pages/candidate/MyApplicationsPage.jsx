import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh, FaClockRotateLeft, FaFileArrowUp } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { jobService } from '../../services';
import { STATUS_COLORS, capitalize, formatDateTime } from '../../utils/format';
import { EmptyState } from '../../components/ui/States';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',         icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',       icon: FaUser },
  { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles },
  { to: '/candidate/recommended',  label: 'Recommended Jobs', icon: FaBriefcase },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',       icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications',  icon: FaClockRotateLeft },
  { to: '/candidate/resume',       label: 'Resume Hub',       icon: FaFileArrowUp },
];

const STATUS_FILTERS = ['', 'pending', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'];

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await jobService.myApplications({ page: 1, limit: 50, status: status || undefined });
      setApplications(data.applications);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout title="My Applications" subtitle="Track the status of your job applications" navItems={navItems}>
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold cursor-pointer border transition-all ${
              status === s
                ? 'bg-primary-600 text-white border-primary-600 dark:neon-badge-yellow shadow-md'
                : 'bg-white dark:bg-[#080C1B] text-slate-600 dark:text-slate-200 border-slate-200 dark:border-cyan-500/40 hover:border-cyan-400'
            }`}
          >
            {s === '' ? 'All Applications' : capitalize(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-24" />)}</div>
      ) : applications.length === 0 ? (
        <div className="card p-8 rounded-[24px] bg-white dark:neon-playing-card-cyan text-center">
          <EmptyState
            icon={FaBriefcase}
            title="No applications yet"
            description="Apply to jobs and track them here."
            action={<Link to="/jobs" className="btn-primary">Browse jobs</Link>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app._id} className="card p-5 rounded-[22px] bg-white dark:neon-playing-card-cyan shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/jobs/${app.job?._id}`} className="font-black text-slate-900 dark:text-white dark:neon-text-cyan hover:text-primary truncate block text-base">
                    {app.job?.jobTitle || 'Job no longer available'}
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-cyan-200/90 font-medium mt-0.5">{app.job?.companyName} • {app.job?.location}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full dark:neon-badge-yellow">
                  {capitalize(app.status)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-cyan-500/20 text-xs text-slate-500 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5"><FaClockRotateLeft className="h-3 w-3 text-cyan-400" /> Applied {formatDateTime(app.createdAt)}</span>
                {app.interview?.scheduled && app.interview.date && (
                  <span className="badge bg-primary-50 dark:neon-badge-pink">
                    Interview: {formatDateTime(app.interview.date)} ({app.interview.mode})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyApplicationsPage;
