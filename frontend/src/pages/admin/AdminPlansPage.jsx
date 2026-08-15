import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaGem,
  FaCheck,
  FaClock,
  FaBolt,
  FaShield,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaFileArrowDown,
  FaAddressBook,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const AdminPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    monthlyPrice: 79,
    yearlyPrice: 790,
    currency: 'USD',
    isFree: false,

    // Free Trial
    hasTrial: true,
    trialDays: 14,
    trialOnlyForNewUsers: true,
    trialOncePerCompany: true,
    requirePaymentMethodForTrial: false,
    autoConvertToPaid: true,

    // Quotas & Features
    maxJobPosts: 10,
    featuredJobsIncluded: 2,
    urgentJobsIncluded: 1,
    jobBoostsIncluded: 2,
    candidateProfileViews: 100,
    resumeDownloads: 30,
    candidateContactCredits: 40,
    companyPromotion: true,
    aiResumeScreening: true,
    aiCandidateMatching: true,
    recruitmentAnalytics: true,
    teamMembers: 3,
    supportLevel: 'priority',
    badgeText: '',
    isPopular: false,
    isActive: true,
    includedServices: [],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, srvRes] = await Promise.all([
        adminService.plans({ limit: 50 }),
        adminService.services({ limit: 100 }),
      ]);
      setPlans(plansRes.data.plans || []);
      setServices(srvRes.data.services || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      monthlyPrice: 79,
      yearlyPrice: 790,
      currency: 'USD',
      isFree: false,
      hasTrial: true,
      trialDays: 14,
      trialOnlyForNewUsers: true,
      trialOncePerCompany: true,
      requirePaymentMethodForTrial: false,
      autoConvertToPaid: true,
      maxJobPosts: 10,
      featuredJobsIncluded: 2,
      urgentJobsIncluded: 1,
      jobBoostsIncluded: 2,
      candidateProfileViews: 100,
      resumeDownloads: 30,
      candidateContactCredits: 40,
      companyPromotion: true,
      aiResumeScreening: true,
      aiCandidateMatching: true,
      recruitmentAnalytics: true,
      teamMembers: 3,
      supportLevel: 'priority',
      badgeText: '',
      isPopular: false,
      isActive: true,
      includedServices: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice || 0,
      yearlyPrice: plan.yearlyPrice || 0,
      currency: plan.currency || 'USD',
      isFree: Boolean(plan.isFree),
      hasTrial: Boolean(plan.hasTrial),
      trialDays: plan.trialDays || 14,
      trialOnlyForNewUsers: plan.trialOnlyForNewUsers !== undefined ? Boolean(plan.trialOnlyForNewUsers) : true,
      trialOncePerCompany: plan.trialOncePerCompany !== undefined ? Boolean(plan.trialOncePerCompany) : true,
      requirePaymentMethodForTrial: Boolean(plan.requirePaymentMethodForTrial),
      autoConvertToPaid: plan.autoConvertToPaid !== undefined ? Boolean(plan.autoConvertToPaid) : true,
      maxJobPosts: plan.maxJobPosts ?? 5,
      featuredJobsIncluded: plan.featuredJobsIncluded || 0,
      urgentJobsIncluded: plan.urgentJobsIncluded || 0,
      jobBoostsIncluded: plan.jobBoostsIncluded || 0,
      candidateProfileViews: plan.candidateProfileViews || 20,
      resumeDownloads: plan.resumeDownloads || 10,
      candidateContactCredits: plan.candidateContactCredits || 10,
      companyPromotion: Boolean(plan.companyPromotion),
      aiResumeScreening: Boolean(plan.aiResumeScreening),
      aiCandidateMatching: Boolean(plan.aiCandidateMatching),
      recruitmentAnalytics: Boolean(plan.recruitmentAnalytics),
      teamMembers: plan.teamMembers || 1,
      supportLevel: plan.supportLevel || 'email',
      badgeText: plan.badgeText || '',
      isPopular: Boolean(plan.isPopular),
      isActive: Boolean(plan.isActive),
      includedServices: (plan.includedServices || []).map((s) => (typeof s === 'object' ? s._id : s)),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Plan name is required');
    setSaving(true);
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan._id, formData);
        toast.success('Subscription plan updated');
      } else {
        await adminService.createPlan(formData);
        toast.success('Subscription plan created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (plan) => {
    try {
      await adminService.togglePlan(plan._id);
      toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
      setPlans((prev) => prev.map((p) => (p._id === plan._id ? { ...p, isActive: !p.isActive } : p)));
    } catch (err) {
      toast.error(err.message || 'Failed to toggle plan status');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This may affect users subscribed to it.`)) return;
    try {
      await adminService.deletePlan(plan._id);
      toast.success('Plan deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete plan');
    }
  };

  return (
    <DashboardLayout title="Subscription Plans & Free Trials" subtitle="Manage unlimited pricing tiers, free trial durations, and feature allocations" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Configure employer plans. Admin can set any plan to completely Free, or enable 7/14/30-day free trials.
          </p>
          <button onClick={handleOpenCreate} className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2 rounded-xl">
            <FaPlus className="h-3 w-3" /> Create New Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-6 skeleton h-96" />)
          ) : plans.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-muted">
              No subscription plans defined. Click "Create New Plan" to get started.
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan._id}
                className={`card p-6 flex flex-col justify-between relative transition-all ${
                  plan.isPopular ? 'border-2 border-primary-500 shadow-md' : ''
                } ${!plan.isActive ? 'opacity-60 bg-surface-sunken/30' : ''}`}
              >
                {plan.badgeText && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white font-black text-[10px] uppercase tracking-wider py-0.5 px-3 rounded-full shadow-sm">
                    {plan.badgeText}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-xl text-ink">{plan.name}</h3>
                      <p className="text-xs text-muted mt-0.5">{plan.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(plan)}
                      className={`text-sm ${plan.isActive ? 'text-emerald-500' : 'text-gray-400'}`}
                      title={plan.isActive ? 'Active' : 'Inactive'}
                    >
                      {plan.isActive ? <FaToggleOn className="h-6 w-6" /> : <FaToggleOff className="h-6 w-6" />}
                    </button>
                  </div>

                  {/* Pricing Display */}
                  <div className="my-4 pb-4 border-b border-line">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-ink">
                        {plan.isFree ? 'Free' : formatCurrency(plan.monthlyPrice, plan.currency)}
                      </span>
                      {!plan.isFree && <span className="text-xs text-muted">/ month</span>}
                    </div>
                    {!plan.isFree && (
                      <div className="text-xs text-muted mt-1">
                        or {formatCurrency(plan.yearlyPrice, plan.currency)} / year (Save 17%)
                      </div>
                    )}

                    {/* Free Trial Pill */}
                    {plan.hasTrial && (
                      <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-500/10 text-emerald-600 font-bold text-xs px-2.5 py-1 rounded-lg">
                        <FaClock className="h-3 w-3" /> {plan.trialDays}-Day Free Trial
                      </div>
                    )}
                  </div>

                  {/* Feature & Quota list */}
                  <div className="space-y-2 text-xs text-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink font-medium">
                        <FaCheck className="text-emerald-500 h-3 w-3" /> Job Posts
                      </span>
                      <span className="font-bold text-ink">
                        {plan.maxJobPosts === -1 ? 'Unlimited' : `${plan.maxJobPosts} jobs`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink font-medium">
                        <FaCheck className="text-emerald-500 h-3 w-3" /> Featured / Urgent
                      </span>
                      <span className="font-bold text-ink">
                        {plan.featuredJobsIncluded} feat / {plan.urgentJobsIncluded} urg
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink font-medium">
                        <FaFileArrowDown className="text-emerald-500 h-3 w-3" /> Resume Downloads
                      </span>
                      <span className="font-bold text-ink">{plan.resumeDownloads}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink font-medium">
                        <FaAddressBook className="text-emerald-500 h-3 w-3" /> Contact Credits
                      </span>
                      <span className="font-bold text-ink">{plan.candidateContactCredits}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink font-medium">
                        <FaUsers className="text-emerald-500 h-3 w-3" /> Team Seats
                      </span>
                      <span className="font-bold text-ink">{plan.teamMembers} members</span>
                    </div>

                    <div className="pt-2 border-t border-line/60 space-y-1">
                      {plan.aiResumeScreening && (
                        <div className="flex items-center gap-1.5 text-primary-600 font-semibold">
                          <FaBolt className="h-3 w-3" /> AI Resume Screening Included
                        </div>
                      )}
                      {plan.aiCandidateMatching && (
                        <div className="flex items-center gap-1.5 text-primary-600 font-semibold">
                          <FaBolt className="h-3 w-3" /> AI Matching Engine Included
                        </div>
                      )}
                      {plan.companyPromotion && (
                        <div className="flex items-center gap-1.5 text-ink font-medium">
                          <FaCheck className="text-emerald-500 h-3 w-3" /> Company Profile Promotion
                        </div>
                      )}
                      <div className="text-[11px] text-muted capitalize">Support: {plan.supportLevel?.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 mt-6 border-t border-line">
                  <button onClick={() => handleOpenEdit(plan)} className="btn-outline !py-2 flex-1 text-xs font-semibold">
                    <FaPen className="inline h-3 w-3 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(plan)} className="btn-danger !py-2 px-3 text-xs" title="Delete Plan">
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Subscription Plan */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Plan Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Professional Growth"
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Slug</label>
              <input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="professional-growth"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Badge Text (Optional)</label>
              <input
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g. Most Popular"
                className="input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input text-sm"
            />
          </div>

          {/* Pricing Controls */}
          <div className="p-3.5 bg-surface-sunken/40 rounded-xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs uppercase text-ink">Completely Free Plan</label>
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="rounded border-line"
              />
            </div>

            {!formData.isFree && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0 })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Yearly Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) || 0 })}
                    className="input text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Free Trial Controls */}
          <div className="p-3.5 bg-surface-sunken/40 rounded-xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs uppercase text-ink flex items-center gap-1.5">
                <FaClock className="text-emerald-500" /> Enable Free Trial
              </label>
              <input
                type="checkbox"
                checked={formData.hasTrial}
                onChange={(e) => setFormData({ ...formData, hasTrial: e.target.checked })}
                className="rounded border-line"
              />
            </div>

            {formData.hasTrial && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Trial Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value, 10) || 14 })}
                    className="input text-sm"
                  />
                  <div className="flex gap-2 mt-1.5">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, trialDays: d })}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md border ${
                          formData.trialDays === d ? 'bg-primary-500 text-white border-primary-500' : 'border-line text-muted'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trialOnlyForNewUsers}
                      onChange={(e) => setFormData({ ...formData, trialOnlyForNewUsers: e.target.checked })}
                      className="rounded border-line"
                    />
                    Trial available only to new users
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trialOncePerCompany}
                      onChange={(e) => setFormData({ ...formData, trialOncePerCompany: e.target.checked })}
                      className="rounded border-line"
                    />
                    Trial available once per company
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePaymentMethodForTrial}
                      onChange={(e) => setFormData({ ...formData, requirePaymentMethodForTrial: e.target.checked })}
                      className="rounded border-line"
                    />
                    Require payment method before trial starts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoConvertToPaid}
                      onChange={(e) => setFormData({ ...formData, autoConvertToPaid: e.target.checked })}
                      className="rounded border-line"
                    />
                    Automatically convert to paid plan after trial ends
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quotas & Features */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Max Job Posts (-1 for unl)</label>
              <input
                type="number"
                value={formData.maxJobPosts}
                onChange={(e) => setFormData({ ...formData, maxJobPosts: parseInt(e.target.value, 10) })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Featured Jobs</label>
              <input
                type="number"
                min="0"
                value={formData.featuredJobsIncluded}
                onChange={(e) => setFormData({ ...formData, featuredJobsIncluded: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Urgent Jobs</label>
              <input
                type="number"
                min="0"
                value={formData.urgentJobsIncluded}
                onChange={(e) => setFormData({ ...formData, urgentJobsIncluded: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Profile Views</label>
              <input
                type="number"
                min="0"
                value={formData.candidateProfileViews}
                onChange={(e) => setFormData({ ...formData, candidateProfileViews: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Resume Downloads</label>
              <input
                type="number"
                min="0"
                value={formData.resumeDownloads}
                onChange={(e) => setFormData({ ...formData, resumeDownloads: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Contact Credits</label>
              <input
                type="number"
                min="0"
                value={formData.candidateContactCredits}
                onChange={(e) => setFormData({ ...formData, candidateContactCredits: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Team Member Seats</label>
              <input
                type="number"
                min="1"
                value={formData.teamMembers}
                onChange={(e) => setFormData({ ...formData, teamMembers: parseInt(e.target.value, 10) || 1 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Support Level</label>
              <select
                value={formData.supportLevel}
                onChange={(e) => setFormData({ ...formData, supportLevel: e.target.value })}
                className="input text-sm"
              >
                <option value="community">Community Support</option>
                <option value="email">Standard Email</option>
                <option value="priority">Priority Support</option>
                <option value="dedicated_manager">Dedicated Account Manager</option>
                <option value="24_7_phone">24/7 Dedicated Phone</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-line text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiResumeScreening}
                onChange={(e) => setFormData({ ...formData, aiResumeScreening: e.target.checked })}
                className="rounded border-line"
              />
              AI Resume Screening & Auto Scoring
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiCandidateMatching}
                onChange={(e) => setFormData({ ...formData, aiCandidateMatching: e.target.checked })}
                className="rounded border-line"
              />
              AI Candidate Matching Engine
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.companyPromotion}
                onChange={(e) => setFormData({ ...formData, companyPromotion: e.target.checked })}
                className="rounded border-line"
              />
              Company Profile Promotion & Showcase
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recruitmentAnalytics}
                onChange={(e) => setFormData({ ...formData, recruitmentAnalytics: e.target.checked })}
                className="rounded border-line"
              />
              Recruitment Analytics & Funnel Dashboard
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="rounded border-line"
              />
              Mark as Popular / Featured Plan
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminPlansPage;
