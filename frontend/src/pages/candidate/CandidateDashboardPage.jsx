import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaFileArrowUp,
  FaCircleCheck, FaArrowRight, FaGaugeHigh, FaGlobe, FaRobot,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { candidateService, jobService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/jobs/JobCard';
import { LoadingJobs } from '../../components/ui/States';
import { STATUS_COLORS, capitalize } from '../../utils/format';

const StatCard = ({ icon: Icon, label, value, to, accent = false }) => (
  <Link to={to} className={`card card-hover p-5 flex items-center gap-4 ${accent ? 'bg-accent/10 border-accent/50' : ''}`}>
    <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent ? 'bg-accent text-ink' : 'bg-accent/15 text-ink'}`}>
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  </Link>
);

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
    { to: '/candidate/recommended',  label: 'Recommended Jobs',icon: FaWandMagicSparkles },
    { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
    { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
    { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  ].map((item) => ({ ...item, active: window.location.pathname.startsWith(item.to) && (item.end ? window.location.pathname === item.to : true) }));

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(' ')[0]}`} subtitle="Here's what's happening with your job search" navItems={navItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FaGaugeHigh}    label="Profile Completion" value={`${profileCompletion}%`}  to="/candidate/profile" />
          <StatCard icon={FaFileArrowUp}  label="Resume Score"       value={`${resumeScore}/100`}     to="/candidate/resume"  accent={resumeScore >= 70} />
          <StatCard icon={FaRegBookmark}  label="Saved Jobs"         value={stats.saved}              to="/candidate/saved-jobs" />
          <StatCard icon={FaBriefcase}    label="Applications"       value={stats.applied}            to="/candidate/applications" />
        </div>

        {profileCompletion < 100 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Complete your profile to get better AI recommendations</p>
              <span className="text-sm font-bold text-ink">{profileCompletion}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
            <Link to="/candidate/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-ink mt-3 hover:underline">
              Complete profile <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Top Matches for You</h2>
            <Link to="/candidate/recommended" className="text-sm font-semibold text-ink hover:underline">View all</Link>
          </div>
          {recommended.length === 0 ? (
            <div className="card p-8 text-center text-muted">
              <p className="text-sm">No recommendations yet. Update your profile with skills to unlock AI matching.</p>
              <Link to="/candidate/profile" className="btn-primary mt-4 !py-2 text-xs">Update Profile</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommended.map((r) => (
                <JobCard key={r._id} job={r} match={r.match?.score} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/jobs" className="card card-hover p-5 flex items-center gap-3">
              <FaWandMagicSparkles className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">Browse Jobs</p>
                <p className="text-xs text-muted">Discover new opportunities</p>
              </div>
            </Link>
            <Link to="/candidate/resume" className="card card-hover p-5 flex items-center gap-3">
              <FaFileArrowUp className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">Resume Hub</p>
                <p className="text-xs text-muted">Build & download ATS resume</p>
              </div>
            </Link>
            <Link to="/candidate/resume" className="card card-hover p-5 flex items-center gap-3">
              <FaRobot className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">AI Resume Builder</p>
                <p className="text-xs text-muted">Generate PDF in one click</p>
              </div>
            </Link>
            <Link to="/jobs/recommended" className="card card-hover p-5 flex items-center gap-3">
              <FaCircleCheck className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">AI Recommendations</p>
                <p className="text-xs text-muted">Jobs matched to your skills</p>
              </div>
            </Link>
            <Link to="/candidate/saved-jobs" className="card card-hover p-5 flex items-center gap-3">
              <FaRegBookmark className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">Saved Jobs</p>
                <p className="text-xs text-muted">View your bookmarked roles</p>
              </div>
            </Link>
            <Link to="/candidate/profile" className="card card-hover p-5 flex items-center gap-3">
              <FaUser className="h-6 w-6 text-ink" />
              <div>
                <p className="font-semibold text-sm">Update Profile</p>
                <p className="text-xs text-muted">Add skills, experience & more</p>
              </div>
            </Link>
          </div>
        </div>

        {stats.applied > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-3">Recent Applications</h2>
            <p className="text-sm text-muted">Track the status of your applications in the Applications tab.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;
