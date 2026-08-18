import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaFileArrowUp,
  FaCircleCheck, FaArrowRight, FaGaugeHigh, FaGlobe, FaRobot, FaBolt,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { candidateService, jobService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/jobs/JobCard';
import { LoadingJobs } from '../../components/ui/States';
import { STATUS_COLORS, capitalize } from '../../utils/format';

const STAT_CARD_THEMES = [
  { cardClass: 'dark:neon-playing-card-cyan', textClass: 'dark:neon-text-cyan', badgeClass: 'dark:neon-badge-cyan' },
  { cardClass: 'dark:neon-playing-card-cyan', textClass: 'dark:neon-text-cyan', badgeClass: 'dark:neon-badge-cyan' },
  { cardClass: 'dark:neon-playing-card-yellow', textClass: 'dark:neon-text-yellow', badgeClass: 'dark:neon-badge-yellow' },
  { cardClass: 'dark:neon-playing-card-cyan', textClass: 'dark:neon-text-cyan', badgeClass: 'dark:neon-badge-cyan' },
];

const StatCard = ({ icon: Icon, label, value, to, themeIdx = 0 }) => {
  const theme = STAT_CARD_THEMES[themeIdx % STAT_CARD_THEMES.length];
  return (
    <Link
      to={to}
      className={`card card-hover p-5 flex items-center gap-4 rounded-[22px] bg-white dark:!bg-[#040816] ${theme.cardClass} shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden`}
    >
      <span className={`h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-black/60 ${theme.badgeClass} shadow-md shrink-0`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className={`text-2xl sm:text-3xl font-black ${theme.textClass} text-slate-900 tracking-tight`}>
          {value}
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-200 truncate mt-0.5">
          {label}
        </p>
      </div>
    </Link>
  );
};

const CandidateDashboardPage = () => {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [resumeScore, setResumeScore] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState({ saved: 0, applied: 0 });

  const load = useCallback(async () => {
    try {
      const [profile, score, recommendedRes, apps, saved] = await Promise.all([
        candidateService.profile().catch(() => ({ data: {} })),
        candidateService.resumeScore().catch(() => ({ data: {} })),
        jobService.recommendations({ page: 1, limit: 3 }).catch(() => ({ data: { jobs: [] } })),
        jobService.myApplications({ page: 1, limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
        candidateService.saved().catch(() => ({ data: { jobs: [] } })),
      ]);
      setProfileCompletion(profile?.data?.profileCompletion ?? 0);
      setResumeScore(score?.data?.score ?? 0);
      setRecommended(recommendedRes?.data?.jobs ?? []);
      setStats({
        saved: saved?.data?.jobs?.length ?? 0,
        applied: apps?.data?.pagination?.total ?? 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const navItems = [
    { to: '/candidate/dashboard',    label: 'Overview',        icon: FaGaugeHigh, end: true },
    { to: '/candidate/profile',      label: 'My Profile',      icon: FaUser },
    { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles },
    { to: '/candidate/recommended',  label: 'Recommended Jobs',icon: FaBolt },
    { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
    { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
    { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  ].map((item) => ({ ...item, active: window.location.pathname.startsWith(item.to) && (item.end ? window.location.pathname === item.to : true) }));

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(' ')[0]}`} subtitle="Real-time career telemetry and opportunity pipeline" navItems={navItems}>
      <div className="space-y-7">
        
        {/* ── 5 Telemetry Stat Cards with AI Portfolio Spotlight ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <StatCard icon={FaWandMagicSparkles} label="Live AI Portfolio" value="Studio"           to="/candidate/portfolio"    themeIdx={0} />
          <StatCard icon={FaGaugeHigh}         label="Profile Match"     value={`${profileCompletion}%`}  to="/candidate/profile"      themeIdx={1} />
          <StatCard icon={FaFileArrowUp}       label="Resume ATS Score"  value={`${resumeScore}/100`}     to="/candidate/resume"       themeIdx={2} />
          <StatCard icon={FaRegBookmark}       label="Saved Jobs"        value={stats.saved}              to="/candidate/saved-jobs"   themeIdx={3} />
          <StatCard icon={FaBriefcase}         label="Applications"      value={stats.applied}            to="/candidate/applications" themeIdx={0} />
        </div>

        {/* ── 1-Click AI Portfolio Studio Banner ── */}
        <div className="p-6 sm:p-7 rounded-[24px] bg-gradient-to-r from-[#040816] via-[#071330] to-[#040816] border-2 border-[#00f0ff] shadow-[0_0_30px_rgba(0,240,255,0.35)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-black mb-3">
              <FaWandMagicSparkles className="h-3 w-3 text-cyan-400" />
              <span>CORE FEATURE • 1-CLICK AI PORTFOLIO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white dark:neon-text-cyan leading-tight">
              Create Your Live Recruiter Portfolio
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5 leading-relaxed">
              Transform your profile into an interactive, multi-theme developer portfolio website with instant public link and QR sharing.
            </p>
          </div>
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link
              to="/candidate/portfolio"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all"
            >
              <FaWandMagicSparkles className="h-3.5 w-3.5" />
              Launch Portfolio Studio →
            </Link>
          </div>
        </div>

        {/* ── Profile Completion Glow Banner ── */}
        {profileCompletion < 100 && (
          <div className="p-6 rounded-[24px] bg-white dark:!bg-[#040816] dark:neon-playing-card-cyan border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FaBolt className="h-4 w-4 text-cyan-400" />
                Complete your profile to unlock 98.7% AI Job Matching
              </p>
              <span className="text-sm font-black dark:neon-text-cyan text-cyan-500">{profileCompletion}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-black/60 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-cyan-500/40">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-300 rounded-full shadow-[0_0_12px_#00f0ff] transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-200 font-semibold">Add your tech stack & past experience</span>
              <Link to="/candidate/profile" className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_0_15px_rgba(0,240,255,0.6)] hover:scale-105 transition-all">
                Complete profile <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Top AI Matches Section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              Top AI Matches for You
            </h2>
            <Link to="/candidate/recommended" className="text-xs sm:text-sm font-bold text-pink-600 dark:neon-text-pink hover:underline flex items-center gap-1">
              View all recommendations <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {recommended.length === 0 ? (
            <div className="p-8 rounded-[24px] bg-white dark:neon-playing-card-cyan text-center border border-slate-200 shadow-xl">
              <p className="text-sm font-medium text-slate-400">No recommendations yet. Update your profile with skills to unlock AI matching.</p>
              <Link to="/candidate/profile" className="btn-primary mt-4 !py-2 text-xs font-bold inline-flex">
                Update Skills Now
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
              {recommended.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;
