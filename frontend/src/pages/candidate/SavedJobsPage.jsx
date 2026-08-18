import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh, FaFileArrowUp, FaXmark, FaTrash, FaGlobe } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { candidateService } from '../../services';
import JobCard from '../../components/jobs/JobCard';
import { EmptyState, LoadingJobs } from '../../components/ui/States';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',         icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',       icon: FaUser },
  { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles },
  { to: '/candidate/recommended',  label: 'Recommended Jobs', icon: FaBriefcase },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',       icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications',  icon: FaBriefcase },
  { to: '/candidate/resume',       label: 'Resume Hub',       icon: FaFileArrowUp },
];

const SavedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await candidateService.saved();
      setJobs(data.jobs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    try {
      await candidateService.toggleSaved(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Saved Jobs" subtitle="Jobs you've bookmarked for later" navItems={navItems}>
      {loading ? (
        <LoadingJobs count={4} />
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FaRegBookmark}
            title="No saved jobs"
            description="Bookmark jobs you're interested in and they'll show up here."
            action={<Link to="/jobs" className="btn-primary">Browse jobs</Link>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${job._id}`} className="font-semibold hover:text-primary truncate block">{job.jobTitle}</Link>
                <p className="text-sm text-muted">{job.companyName} • {job.location}</p>
              </div>
              <button onClick={() => remove(job._id)} className="btn-ghost !py-2 text-sm text-gray-400 hover:text-red-500 shrink-0">
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SavedJobsPage;
