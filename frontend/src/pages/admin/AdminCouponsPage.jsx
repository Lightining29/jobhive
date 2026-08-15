import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaTicket,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaDollarSign,
  FaMagnifyingGlass,
  FaClock,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 50,
    minPurchaseAmount: 0,
    freeTrialDays: 0,
    userType: 'all',
    totalUsageLimit: 500,
    perUserLimit: 1,
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    isActive: true,
  });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminService.coupons({
        page: p,
        limit: 10,
        search: search || undefined,
      });
      setCoupons(data.coupons || []);
      setStats(data.stats || {});
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 50,
      minPurchaseAmount: 0,
      freeTrialDays: 0,
      userType: 'all',
      totalUsageLimit: 500,
      perUserLimit: 1,
      startsAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      name: c.name,
      description: c.description || '',
      discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      minPurchaseAmount: c.minPurchaseAmount || 0,
      freeTrialDays: c.freeTrialDays || 0,
      userType: c.userType || 'all',
      totalUsageLimit: c.totalUsageLimit || 0,
      perUserLimit: c.perUserLimit || 1,
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString().split('T')[0] : '',
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
      isActive: Boolean(c.isActive),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return toast.error('Code and Name are required');
    setSaving(true);
    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, formData);
        toast.success('Coupon updated successfully');
      } else {
        await adminService.createCoupon(formData);
        toast.success('Coupon created successfully');
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await adminService.toggleCoupon(c._id);
      toast.success(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}`);
      setCoupons((prev) => prev.map((item) => (item._id === c._id ? { ...item, isActive: !item.isActive } : item)));
    } catch (err) {
      toast.error(err.message || 'Failed to toggle coupon status');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await adminService.deleteCoupon(c._id);
      toast.success('Coupon deleted');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <DashboardLayout title="Coupons & Discount Engine" subtitle="Create promotional codes, track ROI, manage trial extensions and volume limits" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 border-l-4 border-pink-500">
            <span className="text-xs font-semibold uppercase text-muted">Total Redemptions</span>
            <div className="text-2xl font-black mt-1 text-ink">{stats.totalRedemptions || 0} times</div>
          </div>
          <div className="card p-5 border-l-4 border-emerald-500">
            <span className="text-xs font-semibold uppercase text-muted">Total Discount Given</span>
            <div className="text-2xl font-black mt-1 text-emerald-600">{formatCurrency(stats.totalDiscountGiven || 0)}</div>
          </div>
          <div className="card p-5 border-l-4 border-blue-500">
            <span className="text-xs font-semibold uppercase text-muted">Revenue Generated via Coupons</span>
            <div className="text-2xl font-black mt-1 text-blue-600">{formatCurrency(stats.totalRevenueGenerated || 0)}</div>
          </div>
        </div>

        {/* Top search & Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code or name..."
              className="input !py-2 !pl-9 text-xs w-64 rounded-xl"
            />
          </div>
          <button onClick={handleOpenCreate} className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2 rounded-xl">
            <FaPlus className="h-3 w-3" /> Create New Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">Coupon Code</th>
                  <th className="px-5 py-3.5">Discount / Benefit</th>
                  <th className="px-5 py-3.5">Target Audience</th>
                  <th className="px-5 py-3.5">Usage & Limits</th>
                  <th className="px-5 py-3.5">Validity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">Loading coupons...</td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">
                      No coupon codes found. Click "Create New Coupon" to launch your first promotion.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-black text-base text-primary-600 flex items-center gap-1.5">
                          <FaTicket className="h-3.5 w-3.5" /> {c.code}
                        </div>
                        <div className="font-medium text-xs text-ink">{c.name}</div>
                        <div className="text-[11px] text-muted">{c.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        {c.discountType === 'percentage' && (
                          <div className="font-bold text-pink-600 text-sm">
                            {c.discountValue}% OFF
                            {c.maxDiscountAmount > 0 && <span className="text-xs text-muted block">Cap: ${c.maxDiscountAmount}</span>}
                          </div>
                        )}
                        {c.discountType === 'fixed' && (
                          <div className="font-bold text-emerald-600 text-sm">${c.discountValue} OFF</div>
                        )}
                        {c.discountType === 'free_trial_extension' && (
                          <div className="font-bold text-cyan-600 text-xs">+{c.freeTrialDays} Days Free Trial</div>
                        )}
                        {c.discountType === 'free_subscription' && (
                          <div className="font-bold text-indigo-600 text-xs">100% Free Plan</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge badge-neutral text-[11px] capitalize">
                          {c.userType?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="font-bold text-ink">
                          {c.timesUsed} used {c.totalUsageLimit > 0 ? `/ ${c.totalUsageLimit}` : '(Unlimited)'}
                        </div>
                        <div className="text-muted text-[11px]">Max {c.perUserLimit} per user</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        <div>Starts: {new Date(c.startsAt).toLocaleDateString()}</div>
                        <div>Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`flex items-center gap-1 text-xs font-semibold ${
                            c.isActive ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {c.isActive ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                          {c.isActive ? 'Active' : 'Paused'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenEdit(c)} className="btn-outline !p-2 rounded-lg text-xs" title="Edit">
                          <FaPen className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleDelete(c)} className="btn-danger !p-2 rounded-lg text-xs" title="Delete">
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
            <span>Showing {coupons.length} of {totalCount} coupons</span>
            <Pagination page={page} pages={totalPages} onPageChange={(p) => load(p)} />
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Coupon */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Coupon Code *</label>
              <input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME50"
                className="input text-sm font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Coupon Title *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="New Employer Promo"
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
              placeholder="Internal notes or customer explanation..."
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="input text-sm"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Fixed Dollar Amount ($)</option>
                <option value="free_trial_extension">Free Trial Extension (Days)</option>
                <option value="free_subscription">100% Free Subscription</option>
              </select>
            </div>

            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="input text-sm"
                />
              </div>
            )}

            {formData.discountType === 'fixed' && (
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Discount Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="input text-sm"
                />
              </div>
            )}

            {formData.discountType === 'free_trial_extension' && (
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Additional Trial Days</label>
                <input
                  type="number"
                  min="1"
                  value={formData.freeTrialDays}
                  onChange={(e) => setFormData({ ...formData, freeTrialDays: parseInt(e.target.value, 10) || 14 })}
                  className="input text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Max Discount Cap ($)</label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0 for no limit"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Min Purchase Amount ($)</label>
              <input
                type="number"
                min="0"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Target Audience</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="input text-sm"
              >
                <option value="all">All Users</option>
                <option value="new_users">New Users Only</option>
                <option value="existing_users">Existing Users</option>
                <option value="employers_only">Employers / Recruiters Only</option>
                <option value="candidates_only">Candidates Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Total Usage Limit</label>
              <input
                type="number"
                min="0"
                value={formData.totalUsageLimit}
                onChange={(e) => setFormData({ ...formData, totalUsageLimit: parseInt(e.target.value, 10) || 0 })}
                placeholder="0 for unlimited"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Per-User Limit</label>
              <input
                type="number"
                min="1"
                value={formData.perUserLimit}
                onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value, 10) || 1 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-line">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-line"
              />
              Active and ready for checkout redemption
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminCouponsPage;
