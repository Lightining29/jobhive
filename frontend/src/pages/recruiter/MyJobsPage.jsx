import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaBuilding, FaBriefcase, FaUsers, FaGaugeHigh, FaPlus, FaTrash, FaPenToSquare } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { recruiterService } from '../../services';
import { formatSalary, timeAgo, STATUS_COLORS, capitalize } from '../../utils/format';

const navItems = [
  { to: '/recruiter/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/recruiter/company', label: 'Company Profile', icon: FaBuilding },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: FaPlus },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: FaBriefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: FaUsers },
];

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await recruiterService.myJobs({ page: 1, limit: 50 });
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
    if (!window.confirm('Deactivate this job? Candidates will no longer see it.')) return;
    try {
      await recruiterService.deleteJob(id);
      toast.success('Job deactivated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="My Jobs" subtitle="Manage your posted jobs" navItems={navItems}>
      <div className="flex justify-end mb-4">
        <Link to="/recruiter/post-job" className="btn-primary"><FaPlus className="h-4 w-4" /> Post New Job</Link>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-24" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <FaBriefcase className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-ink mb-1">No jobs posted yet</p>
          <p className="text-sm">Post your first job to start receiving applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/jobs/${job._id}`} className="font-bold hover:text-primary">{job.jobTitle}</Link>
                    {!job.isVerified && <span className="badge bg-orange-50 text-orange-700 border border-orange-200">Pending verification</span>}
                    {!job.isActive && <span className="badge bg-gray-100 text-gray-500 border border-gray-200">Inactive</span>}
                  </div>
                  <p className="text-sm text-muted mt-1">{job.location} • {formatSalary(job)} • Posted {timeAgo(job.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/recruiter/my-jobs/${job._id}/edit`} className="btn-outline !py-2 text-xs"><FaPenToSquare className="h-3.5 w-3.5" /> Edit</Link>
                  {job.isActive && (
                    <button onClick={() => remove(job._id)} className="btn-danger !py-2 text-xs"><FaTrash className="h-3.5 w-3.5" /> Deactivate</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyJobsPage;
