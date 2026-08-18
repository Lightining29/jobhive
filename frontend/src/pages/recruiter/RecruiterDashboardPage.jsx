import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaBuilding, FaBriefcase, FaUsers, FaCalendarDays, FaGaugeHigh, FaPlus, FaUserTie, FaCircleCheck, FaArrowRight,
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

const STAT_THEMES = [
  { card: 'dark:neon-playing-card-cyan', text: 'dark:neon-text-cyan', badge: 'dark:neon-badge-cyan' },
  { card: 'dark:neon-playing-card-pink', text: 'dark:neon-text-pink', badge: 'dark:neon-badge-pink' },
  { card: 'dark:neon-playing-card-yellow', text: 'dark:neon-text-yellow', badge: 'dark:neon-badge-yellow' },
  { card: 'dark:neon-playing-card-purple', text: 'dark:neon-text-pink', badge: 'dark:neon-badge-pink' },
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
    { label: 'Active Openings', value: data?.stats?.activeJobs ?? 0, icon: FaCircleCheck, to: '/recruiter/my-jobs' },
    { label: 'Applicants', value: data?.stats?.applicants ?? 0, icon: FaUsers, to: '/recruiter/applications' },
    { label: 'Interviews', value: data?.stats?.interviews ?? 0, icon: FaCalendarDays, to: '/recruiter/applications' },
  ];

  return (
    <DashboardLayout title="Recruiter Command Hub" subtitle="Talent pipeline, posted roles, and applicant analytics" navItems={navItems}>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-28" />)}
        </div>
      ) : (
        <div className="space-y-7">
          {/* ── 4 Telemetry Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((s, idx) => {
              const th = STAT_THEMES[idx % STAT_THEMES.length];
              return (
                <Link
                  key={s.label}
                  to={s.to}
                  className={`card card-hover p-5 rounded-[22px] ${th.card} shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden`}
                >
                  <span className={`h-11 w-11 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-black/40 ${th.badge} shadow-md mb-3`}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <p className={`text-2xl sm:text-3xl font-black ${th.text} text-slate-900 tracking-tight`}>{s.value}</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-300 mt-0.5">{s.label}</p>
                </Link>
              );
            })}
          </div>

          {!data?.company && (
            <div className="p-6 rounded-[24px] bg-white dark:neon-playing-card-yellow border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-black text-lg text-slate-900 dark:text-white">Register your company profile</p>
                <p className="text-sm text-slate-500 dark:text-amber-300/80 font-medium">You need a verified company profile before publishing job openings.</p>
              </div>
              <Link to="/recruiter/company" className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:scale-105 transition-all">
                Register Company
              </Link>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                Recent Applicants
              </h2>
              <Link to="/recruiter/applications" className="text-xs sm:text-sm font-bold text-pink-600 dark:neon-text-pink hover:underline flex items-center gap-1">
                View all <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            {data?.recentApplications?.length === 0 ? (
              <div className="p-8 rounded-[24px] bg-white dark:neon-playing-card-cyan text-center border border-slate-200 shadow-xl">
                <p className="text-sm font-medium text-slate-400">No applicants yet. Post a job to start receiving candidate submissions.</p>
                <Link to="/recruiter/post-job" className="btn-primary mt-4 !py-2 text-xs font-bold inline-flex">
                  Post a Job Opening
                </Link>
              </div>
            ) : (
              <div className="rounded-[24px] bg-white dark:neon-playing-card-pink border border-slate-200 overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-100 dark:divide-pink-500/20">
                  {data?.recentApplications?.map((app) => (
                    <div key={app._id} className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-pink-500/5 transition-colors">
                      <div>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{app.applicantName || app.candidate?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-pink-300 font-medium">Applied for <strong className="text-slate-700 dark:text-white">{app.job?.jobTitle}</strong></p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full dark:neon-badge-yellow">
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{formatDateTime(app.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default RecruiterDashboardPage;
