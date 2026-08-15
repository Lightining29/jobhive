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
  { to: '/candidate/recommended',  label: 'Recommended Jobs', icon: FaWandMagicSparkles },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',       icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications',  icon: FaBriefcase },
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
            className={`badge py-1.5 px-3 cursor-pointer border ${status === s ? 'bg-accent text-ink border-accent' : 'bg-white text-muted border-line hover:border-accent'}`}
          >
            {s === '' ? 'All' : capitalize(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-24" />)}</div>
      ) : applications.length === 0 ? (
        <div className="card">
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
            <div key={app._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/jobs/${app.job?._id}`} className="font-bold hover:text-primary truncate block">
                    {app.job?.jobTitle || 'Job no longer available'}
                  </Link>
                  <p className="text-sm text-muted">{app.job?.companyName} • {app.job?.location}</p>
                </div>
                <span className={`badge border ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>{capitalize(app.status)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1.5"><FaClockRotateLeft className="h-3 w-3" /> Applied {formatDateTime(app.createdAt)}</span>
                {app.interview?.scheduled && app.interview.date && (
                  <span className="badge bg-primary-50 text-yellow-800 border border-accent">
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
