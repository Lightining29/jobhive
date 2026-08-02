import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUsers, FaBuilding, FaBriefcase, FaFlag, FaGaugeHigh, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminService } from '../../services';
import { formatSalary, timeAgo, capitalize } from '../../utils/format';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/companies', label: 'Companies', icon: FaBuilding },
  { to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FaFlag },
];

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.jobs({ page: 1, limit: 50, search: search || undefined, source: source || undefined, category: category || undefined });
      setJobs(data.jobs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, source, category]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [load]);

  const toggleActive = async (job) => {
    try {
      await adminService.moderateJob(job._id, { isActive: !job.isActive });
      toast.success(job.isActive ? 'Job deactivated' : 'Job activated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleVerified = async (job) => {
    try {
      await adminService.moderateJob(job._id, { isVerified: !job.isVerified });
      toast.success(job.isVerified ? 'Verification removed' : 'Job verified');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Remove "${job.jobTitle}" from the platform?`)) return;
    try {
      await adminService.deleteJob(job._id);
      toast.success('Job removed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Job Moderation" subtitle="Remove fake jobs and manage listings" navItems={navItems}>
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or company..." className="input !w-72" />
        <select value={source} onChange={(e) => setSource(e.target.value)} className="input !w-auto">
          <option value="">All sources</option>
          <option value="recruiter">Recruiter</option><option value="jooble">Jooble</option><option value="adzuna">Adzuna</option>
          <option value="arbeitnow">Arbeitnow</option><option value="remotive">Remotive</option><option value="muse">The Muse</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input !w-auto">
          <option value="">All categories</option><option value="technical">Technical</option><option value="non-technical">Non-Technical</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-5 skeleton h-20" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card p-10 text-center text-muted"><FaBriefcase className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p>No jobs found.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-gray-50 border-b border-line text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Job</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Source</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Category</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Salary</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Posted</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Verified</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-primary-50/40">
                  <td className="px-4 py-3">
                    <Link to={`/jobs/${job._id}`} className="font-semibold hover:text-primary block truncate max-w-[220px]">{job.jobTitle}</Link>
                    <p className="text-xs text-muted">{job.companyName}</p>
                  </td>
                  <td className="px-4 py-3"><span className="badge bg-gray-100 text-muted border border-line capitalize">{job.source}</span></td>
                  <td className="px-4 py-3 text-muted capitalize">{job.category}</td>
                  <td className="px-4 py-3 text-muted">{formatSalary(job)}</td>
                  <td className="px-4 py-3 text-muted">{timeAgo(job.postedDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${job.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {job.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleActive(job)} title={job.isActive ? 'Deactivate' : 'Activate'} className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-gray-50">
                        {job.isActive ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                      </button>
                      <button onClick={() => toggleVerified(job)} title={job.isVerified ? 'Unverify' : 'Verify'} className={`p-2 rounded-lg ${job.isVerified ? 'text-emerald-600' : 'text-gray-400'} hover:bg-gray-50`}>
                        {job.isVerified ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                      </button>
                      <button onClick={() => remove(job)} title="Remove job" className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminJobsPage;
