import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaGears,
  FaMagnifyingGlass,
  FaCoins,
  FaClock,
  FaTag,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'job_posting', label: 'Job Postings & Boosts' },
  { value: 'candidate_access', label: 'Candidate Access & Contacts' },
  { value: 'branding', label: 'Employer Branding' },
  { value: 'ai_tools', label: 'AI Screening & Matching' },
  { value: 'communication', label: 'Candidate Communication' },
  { value: 'verification', label: 'Background & Verification' },
  { value: 'other', label: 'Other Services' },
];

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'job_posting',
    price: 0,
    currency: 'USD',
    durationDays: 30,
    usageLimit: 1,
    creditsGranted: 0,
    taxPercent: 0,
    discountPercent: 0,
    isSubscriptionOnly: false,
    canPurchaseSeparately: true,
    isActive: true,
  });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminService.services({
        page: p,
        limit: 10,
        category: categoryFilter || undefined,
        search: search || undefined,
      });
      setServices(data.services || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: 'job_posting',
      price: 29,
      currency: 'USD',
      durationDays: 30,
      usageLimit: 1,
      creditsGranted: 0,
      taxPercent: 0,
      discountPercent: 0,
      isSubscriptionOnly: false,
      canPurchaseSeparately: true,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      slug: srv.slug,
      description: srv.description || '',
      category: srv.category || 'job_posting',
      price: srv.price || 0,
      currency: srv.currency || 'USD',
      durationDays: srv.durationDays || 30,
      usageLimit: srv.usageLimit || 1,
      creditsGranted: srv.creditsGranted || 0,
      taxPercent: srv.taxPercent || 0,
      discountPercent: srv.discountPercent || 0,
      isSubscriptionOnly: Boolean(srv.isSubscriptionOnly),
      canPurchaseSeparately: srv.canPurchaseSeparately !== undefined ? Boolean(srv.canPurchaseSeparately) : true,
      isActive: Boolean(srv.isActive),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Service name is required');
    setSaving(true);
    try {
      if (editingService) {
        await adminService.updateService(editingService._id, formData);
        toast.success('Service updated successfully');
      } else {
        await adminService.createService(formData);
        toast.success('Service created successfully');
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (srv) => {
    try {
      await adminService.toggleService(srv._id);
      toast.success(`Service ${!srv.isActive ? 'activated' : 'deactivated'}`);
      setServices((prev) => prev.map((s) => (s._id === srv._id ? { ...s, isActive: !s.isActive } : s)));
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (srv) => {
    if (!window.confirm(`Are you sure you want to delete service "${srv.name}"?`)) return;
    try {
      await adminService.deleteService(srv._id);
      toast.success('Service deleted');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete service');
    }
  };

  return (
    <DashboardLayout title="Services & Add-ons Catalog" subtitle="Configure and price standalone services and portal features" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="input !py-2 !pl-9 text-xs w-64 rounded-xl"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <button onClick={handleOpenCreate} className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2 rounded-xl">
            <FaPlus className="h-3 w-3" /> Add New Service
          </button>
        </div>

        {/* Services Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">Service Details</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price & Tax</th>
                  <th className="px-5 py-3.5">Validity & Quota</th>
                  <th className="px-5 py-3.5">Purchasable</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">
                      Loading services catalog...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">
                      No services found. Click "Add New Service" to create one.
                    </td>
                  </tr>
                ) : (
                  services.map((srv) => (
                    <tr key={srv._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-ink">{srv.name}</div>
                        <div className="text-xs text-muted max-w-xs truncate">{srv.description}</div>
                        <div className="text-[10px] text-muted mt-0.5 font-mono">{srv.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge text-[11px] capitalize badge-neutral">
                          {srv.category?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-emerald-600">
                          {srv.price === 0 ? 'Free' : formatCurrency(srv.price, srv.currency)}
                        </div>
                        {srv.taxPercent > 0 && <div className="text-[11px] text-muted">+{srv.taxPercent}% Tax</div>}
                        {srv.discountPercent > 0 && <div className="text-[11px] text-pink-600 font-semibold">{srv.discountPercent}% Off</div>}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted space-y-0.5">
                        <div><FaClock className="inline h-3 w-3 mr-1 text-muted" /> {srv.durationDays} days</div>
                        {srv.creditsGranted > 0 && (
                          <div className="font-semibold text-primary-600">
                            <FaCoins className="inline h-3 w-3 mr-1" /> {srv.creditsGranted} credits
                          </div>
                        )}
                        {srv.usageLimit > 1 && <div>Limit: {srv.usageLimit} uses</div>}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {srv.canPurchaseSeparately ? (
                          <span className="badge badge-success text-[10px]">Standalone</span>
                        ) : (
                          <span className="badge badge-neutral text-[10px]">Plan Only</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggle(srv)}
                          className={`flex items-center gap-1.5 text-xs font-semibold ${
                            srv.isActive ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {srv.isActive ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
                          {srv.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(srv)}
                          className="btn-outline !p-2 rounded-lg hover:text-primary-600 text-xs"
                          title="Edit Service"
                        >
                          <FaPen className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv)}
                          className="btn-danger !p-2 rounded-lg text-xs"
                          title="Delete Service"
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
            <span>Showing {services.length} of {totalCount} services</span>
            <Pagination page={page} pages={totalPages} total={totalCount} limit={10} onPageChange={(p) => load(p)} itemLabel="services" />
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Service */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingService ? 'Edit Service' : 'Create New Service'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Service Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Featured Job Listing (30 Days)"
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Slug (Identifier)</label>
              <input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="featured-job-30d"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input text-sm"
              >
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what the service includes and benefits..."
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxPercent}
                onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 30 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Usage Limit</label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 1 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Credits Granted</label>
              <input
                type="number"
                min="0"
                value={formData.creditsGranted}
                onChange={(e) => setFormData({ ...formData, creditsGranted: parseInt(e.target.value, 10) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-line">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.canPurchaseSeparately}
                onChange={(e) => setFormData({ ...formData, canPurchaseSeparately: e.target.checked })}
                className="rounded border-line"
              />
              Can be purchased separately as standalone add-on
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSubscriptionOnly}
                onChange={(e) => setFormData({ ...formData, isSubscriptionOnly: e.target.checked })}
                className="rounded border-line"
              />
              Exclusive to subscription plans (cannot be bought à la carte)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-line"
              />
              Active and visible in store
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminServicesPage;
