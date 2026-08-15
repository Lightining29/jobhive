import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaMagnifyingGlass,
  FaCoins,
  FaClock,
  FaGem,
  FaUserCheck,
  FaUserSlash,
  FaEye,
  FaCheck,
  FaXmark,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { capitalize, formatDateTime, formatCurrency } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Modal forms
  const [creditForm, setCreditForm] = useState({
    jobPosts: 5,
    featuredJobs: 2,
    resumeDownloads: 10,
    contactCredits: 15,
  });

  const [trialDays, setTrialDays] = useState(14);
  const [planForm, setPlanForm] = useState({ planId: '', status: 'active', isTrial: false });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [usersRes, plansRes] = await Promise.all([
        adminService.users({
          page: p,
          limit: 12,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        adminService.plans({ limit: 50 }),
      ]);
      setUsers(usersRes.data.users || []);
      setTotalPages(usersRes.data.pagination?.pages || 1);
      setTotalCount(usersRes.data.pagination?.total || 0);
      setPlans(plansRes.data.plans || []);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUser(user._id, { status: nextStatus });
      toast.success(`User marked as ${nextStatus}`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u)));
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleOpenCredits = (user) => {
    setSelectedUser(user);
    setCreditForm({
      jobPosts: 5,
      featuredJobs: 2,
      resumeDownloads: 10,
      contactCredits: 15,
    });
    setCreditModalOpen(true);
  };

  const handleGrantCredits = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data } = await adminService.grantCredits(selectedUser._id, creditForm);
      toast.success(data.message || 'Credits granted successfully');
      setCreditModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to grant credits');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenTrial = (user) => {
    setSelectedUser(user);
    setTrialDays(14);
    setTrialModalOpen(true);
  };

  const handleExtendTrial = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data } = await adminService.extendTrial(selectedUser._id, { additionalDays: trialDays });
      toast.success(data.message || 'Trial extended successfully');
      setTrialModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to extend trial');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenSub = (user) => {
    setSelectedUser(user);
    setPlanForm({
      planId: user.subscription?.plan?._id || user.subscription?.plan || (plans[0] && plans[0]._id) || '',
      status: 'active',
      isTrial: false,
    });
    setSubModalOpen(true);
  };

  const handleChangeSubscription = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data } = await adminService.changeSubscription(selectedUser._id, planForm);
      toast.success(data.message || 'Subscription changed');
      setSubModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to update subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const { data } = await adminService.getUser(user._id);
      setUserDetails(data);
      setDetailModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to load user profile');
    }
  };

  return (
    <DashboardLayout title="User & Employer Management" subtitle="Manage candidates, employers, credit allocations, and subscription trials" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="input !py-2 !pl-9 text-xs w-64 rounded-xl"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="recruiter">Recruiters / Employers</option>
              <option value="admin">Administrators</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-muted">
            Total Users: <span className="text-ink font-bold">{totalCount}</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role & Company</th>
                  <th className="px-5 py-3.5">Plan & Free Trial</th>
                  <th className="px-5 py-3.5">Hiring Credits</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">No users matched the criteria.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          {u.name}
                          {u.emailVerified && <FaCheck className="h-3 w-3 text-emerald-500" title="Email Verified" />}
                        </div>
                        <div className="text-xs text-muted font-mono">{u.email}</div>
                        <div className="text-[10px] text-muted">Joined {formatDateTime(u.createdAt)}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`badge text-[11px] capitalize ${u.role === 'recruiter' ? 'badge-primary' : u.role === 'admin' ? 'badge-danger' : 'badge-neutral'}`}>
                          {u.role}
                        </span>
                        {u.company && (
                          <div className="text-xs font-semibold text-ink mt-1 truncate max-w-[140px]">
                            {u.company.name || 'Company Assigned'}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="font-bold text-ink flex items-center gap-1">
                          <FaGem className="text-primary-500 h-3 w-3" />
                          {u.subscription?.planName || 'Free'}
                        </div>
                        {u.subscription?.isTrial ? (
                          <div className="text-cyan-600 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                            <FaClock className="h-2.5 w-2.5" /> Trial until{' '}
                            {u.subscription.trialEndsAt ? new Date(u.subscription.trialEndsAt).toLocaleDateString() : 'Active'}
                          </div>
                        ) : (
                          <div className="text-muted text-[11px] capitalize">Status: {u.subscription?.status || 'Active'}</div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {u.role === 'recruiter' ? (
                          <div className="space-y-0.5 font-medium text-muted">
                            <div>Jobs: <span className="font-bold text-ink">{u.credits?.jobPosts || 0}</span></div>
                            <div>Contacts: <span className="font-bold text-primary-600">{u.credits?.contactCredits || 0}</span></div>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`badge text-[11px] font-bold cursor-pointer capitalize ${
                            u.status === 'active' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {u.status === 'active' ? <FaUserCheck className="inline mr-1" /> : <FaUserSlash className="inline mr-1" />}
                          {u.status}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(u)}
                          className="btn-outline !p-1.5 text-xs rounded-lg"
                          title="View Profile & Activity"
                        >
                          <FaEye className="h-3 w-3" />
                        </button>
                        {u.role === 'recruiter' && (
                          <>
                            <button
                              onClick={() => handleOpenCredits(u)}
                              className="btn-outline !py-1 !px-2 text-[11px] rounded-lg text-emerald-600 hover:border-emerald-500 font-semibold"
                              title="Grant Free Credits"
                            >
                              <FaCoins className="inline mr-1" /> +Credits
                            </button>
                            <button
                              onClick={() => handleOpenTrial(u)}
                              className="btn-outline !py-1 !px-2 text-[11px] rounded-lg text-cyan-600 hover:border-cyan-500 font-semibold"
                              title="Extend Free Trial"
                            >
                              <FaClock className="inline mr-1" /> +Trial
                            </button>
                            <button
                              onClick={() => handleOpenSub(u)}
                              className="btn-outline !py-1 !px-2 text-[11px] rounded-lg text-primary-600 hover:border-primary-500 font-semibold"
                              title="Change Subscription Plan"
                            >
                              <FaGem className="inline mr-1" /> Plan
                            </button>
                          </>
                        )}
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
            <span>Showing {users.length} of {totalCount} users</span>
            <Pagination page={page} pages={totalPages} onPageChange={(p) => load(p)} />
          </div>
        )}
      </div>

      {/* Modal: Grant Credits */}
      <Modal isOpen={creditModalOpen} onClose={() => setCreditModalOpen(false)} title={`Grant Credits: ${selectedUser?.name}`}>
        <form onSubmit={handleGrantCredits} className="space-y-4 text-sm">
          <p className="text-xs text-muted">
            Directly add complimentary job posting, resume download, and contact credits to this employer's account.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Job Postings (+)</label>
              <input
                type="number"
                min="0"
                value={creditForm.jobPosts}
                onChange={(e) => setCreditForm({ ...creditForm, jobPosts: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Featured Jobs (+)</label>
              <input
                type="number"
                min="0"
                value={creditForm.featuredJobs}
                onChange={(e) => setCreditForm({ ...creditForm, featuredJobs: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Resume Downloads (+)</label>
              <input
                type="number"
                min="0"
                value={creditForm.resumeDownloads}
                onChange={(e) => setCreditForm({ ...creditForm, resumeDownloads: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Candidate Contacts (+)</label>
              <input
                type="number"
                min="0"
                value={creditForm.contactCredits}
                onChange={(e) => setCreditForm({ ...creditForm, contactCredits: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setCreditModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn-primary !py-2 text-xs font-bold">
              {processing ? 'Granting...' : 'Grant Credits'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Extend Free Trial */}
      <Modal isOpen={trialModalOpen} onClose={() => setTrialModalOpen(false)} title={`Extend Free Trial: ${selectedUser?.name}`}>
        <form onSubmit={handleExtendTrial} className="space-y-4 text-sm">
          <p className="text-xs text-muted">
            Extend this employer's free trial period. They will receive an automated in-app notification confirming their new trial expiration date.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Additional Days</label>
            <input
              type="number"
              min="1"
              max="90"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value, 10) || 14)}
              className="input text-sm"
            />
            <div className="flex gap-2 mt-2">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTrialDays(d)}
                  className={`text-xs px-3 py-1 rounded-lg border ${trialDays === d ? 'bg-cyan-600 text-white border-cyan-600' : 'border-line text-muted'}`}
                >
                  +{d} Days
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setTrialModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn-primary !py-2 text-xs font-bold">
              {processing ? 'Extending...' : 'Extend Trial'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Subscription Plan */}
      <Modal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} title={`Change Subscription: ${selectedUser?.name}`}>
        <form onSubmit={handleChangeSubscription} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Target Subscription Plan</label>
            <select
              value={planForm.planId}
              onChange={(e) => setPlanForm({ ...planForm, planId: e.target.value })}
              className="input text-sm"
            >
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.isFree ? 'Free' : `$${p.monthlyPrice}/mo`})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Subscription Status</label>
              <select
                value={planForm.status}
                onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                className="input text-sm"
              >
                <option value="active">Active (Paid)</option>
                <option value="trial">Free Trial</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Is Free Trial</label>
              <select
                value={planForm.isTrial ? 'true' : 'false'}
                onChange={(e) => setPlanForm({ ...planForm, isTrial: e.target.value === 'true' })}
                className="input text-sm"
              >
                <option value="false">Standard Paid</option>
                <option value="true">Free Trial Mode</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setSubModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn-primary !py-2 text-xs font-bold">
              {processing ? 'Applying...' : 'Apply Plan Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details & History */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="User Activity & Account Overview">
        {userDetails && (
          <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-extrabold text-lg">{userDetails.user?.name}</h3>
                <p className="text-xs text-muted">{userDetails.user?.email} • {userDetails.user?.role}</p>
              </div>
              <span className={`badge ${userDetails.user?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {userDetails.user?.status}
              </span>
            </div>

            {/* Credits Summary */}
            <div className="p-3 bg-surface-sunken/40 rounded-xl border border-line">
              <h4 className="font-bold text-xs uppercase text-muted mb-2">Live Quotas & Credits Balance</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>Job Posts: <span className="font-bold text-ink">{userDetails.user?.credits?.jobPosts || 0}</span></div>
                <div>Featured: <span className="font-bold text-ink">{userDetails.user?.credits?.featuredJobs || 0}</span></div>
                <div>Urgent: <span className="font-bold text-ink">{userDetails.user?.credits?.urgentJobs || 0}</span></div>
                <div>Views: <span className="font-bold text-ink">{userDetails.user?.credits?.profileViews || 0}</span></div>
                <div>Downloads: <span className="font-bold text-ink">{userDetails.user?.credits?.resumeDownloads || 0}</span></div>
                <div>Contacts: <span className="font-bold text-primary-600">{userDetails.user?.credits?.contactCredits || 0}</span></div>
              </div>
            </div>

            {/* Recent Payments */}
            <div>
              <h4 className="font-bold text-xs uppercase text-muted mb-2">Transaction History</h4>
              {userDetails.transactions?.length === 0 ? (
                <p className="text-xs text-muted py-2">No payment transactions on record.</p>
              ) : (
                <div className="divide-y divide-line text-xs">
                  {userDetails.transactions?.map((tx) => (
                    <div key={tx._id} className="py-2 flex justify-between">
                      <div>
                        <div className="font-semibold text-ink">{tx.transactionId}</div>
                        <div className="text-[11px] text-muted capitalize">{tx.type} • {formatDateTime(tx.createdAt)}</div>
                      </div>
                      <div className="font-bold text-emerald-600">{formatCurrency(tx.totalAmount, tx.currency)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
