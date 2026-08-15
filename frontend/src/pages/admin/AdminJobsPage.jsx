import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaMagnifyingGlass,
  FaStar,
  FaCheck,
  FaXmark,
  FaTrash,
  FaArrowTrendUp,
  FaBolt,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { capitalize, formatDateTime } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminService.jobs({
        page: p,
        limit: 12,
        isVerified: verifiedFilter || undefined,
        category: categoryFilter || undefined,
        source: sourceFilter || undefined,
        search: search || undefined,
      });
      setJobs(data.jobs || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [verifiedFilter, categoryFilter, sourceFilter, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleVerify = async (job, isVerified) => {
    try {
      await adminService.moderateJob(job._id, { isVerified, isActive: true });
      toast.success(`Job marked as ${isVerified ? 'verified & approved' : 'pending'}`);
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, isVerified } : j)));
    } catch (err) {
      toast.error(err.message || 'Failed to update job status');
    }
  };

  const handleToggleFeatured = async (job) => {
    try {
      const { data } = await adminService.toggleFeaturedJob(job._id);
      toast.success(data.message);
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, trendingScore: (j.trendingScore || 0) > 0 ? 0 : 50 } : j)));
    } catch (err) {
      toast.error(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Remove job "${job.jobTitle}" from platform?`)) return;
    try {
      await adminService.deleteJob(job._id);
      toast.success('Job removed');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete job');
    }
  };

  return (
    <DashboardLayout title="Job Moderation & Verification" subtitle="Review listings, approve employer posts, feature top jobs and moderate flags" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title or company..."
                className="input !py-2 !pl-9 text-xs w-64 rounded-xl"
              />
            </div>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Verification Status</option>
              <option value="true">Approved / Verified</option>
              <option value="false">Pending Verification</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="non-technical">Non-Technical</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Sources</option>
              <option value="recruiter">Recruiter Direct</option>
              <option value="greenhouse">Greenhouse ATS</option>
              <option value="ashby">Ashby ATS</option>
              <option value="lever">Lever ATS</option>
              <option value="amazon">Amazon Careers</option>
              <option value="internshala">Internshala</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-muted">
            Total Jobs: <span className="text-ink font-bold">{totalCount}</span>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">Job Title & Company</th>
                  <th className="px-5 py-3.5">Category & Work Mode</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Promotion</th>
                  <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">Loading jobs...</td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">No jobs match your filter criteria.</td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <a href={`/jobs/${j._id}`} target="_blank" rel="noreferrer" className="font-bold text-ink hover:text-primary-600">
                          {j.jobTitle}
                        </a>
                        <div className="text-xs text-muted font-medium">{j.companyName} • {j.location || 'Remote'}</div>
                        <div className="text-[10px] text-muted">Posted {formatDateTime(j.createdAt)}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`badge text-[11px] capitalize ${j.category === 'technical' ? 'badge-primary' : 'badge-neutral'}`}>
                          {j.category || 'General'}
                        </span>
                        <div className="text-xs text-muted mt-1 capitalize">{j.workMode || 'Full-Time'}</div>
                      </td>

                      <td className="px-5 py-4 text-xs font-mono uppercase text-muted">
                        <span className="bg-surface-sunken px-2 py-0.5 rounded border border-line">{j.source || 'Direct'}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`badge text-[11px] font-semibold ${j.isVerified ? 'badge-success' : 'badge-danger'}`}>
                          {j.isVerified ? 'Verified' : 'Pending Review'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleFeatured(j)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            (j.trendingScore || 0) > 0
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'border-line text-muted hover:border-amber-500/50'
                          }`}
                        >
                          <FaStar className={`h-3 w-3 ${(j.trendingScore || 0) > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                          {(j.trendingScore || 0) > 0 ? 'Featured' : 'Standard'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        {!j.isVerified ? (
                          <button
                            onClick={() => handleVerify(j, true)}
                            className="btn-outline !py-1.5 !px-2.5 text-xs text-emerald-600 border-emerald-500 hover:bg-emerald-500/10 font-semibold"
                            title="Approve Job"
                          >
                            <FaCheck className="inline mr-1" /> Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(j, false)}
                            className="btn-outline !py-1.5 !px-2.5 text-xs text-amber-600 border-amber-500 hover:bg-amber-500/10 font-semibold"
                            title="Set to Pending"
                          >
                            <FaXmark className="inline mr-1" /> Unverify
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(j)}
                          className="btn-danger !p-1.5 text-xs rounded-lg"
                          title="Delete Job"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Showing {jobs.length} of {totalCount} jobs</span>
            <Pagination page={page} pages={totalPages} onPageChange={(p) => load(p)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminJobsPage;
