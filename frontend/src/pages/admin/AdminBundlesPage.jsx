import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaBoxesPacking,
  FaCheck,
  FaPercent,
  FaClock,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const AdminBundlesPage = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 99,
    originalPrice: 150,
    currency: 'USD',
    validityDays: 45,
    jobPostsIncluded: 5,
    featuredJobsIncluded: 2,
    urgentJobsIncluded: 1,
    profileViewsIncluded: 50,
    resumeDownloadsIncluded: 20,
    contactCreditsIncluded: 25,
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.bundles({ limit: 50 });
      setBundles(data.bundles || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCreate = () => {
    setEditingBundle(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 99,
      originalPrice: 150,
      currency: 'USD',
      validityDays: 45,
      jobPostsIncluded: 5,
      featuredJobsIncluded: 2,
      urgentJobsIncluded: 1,
      profileViewsIncluded: 50,
      resumeDownloadsIncluded: 20,
      contactCreditsIncluded: 25,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBundle(b);
    setFormData({
      name: b.name,
      slug: b.slug,
      description: b.description || '',
      price: b.price || 0,
      originalPrice: b.originalPrice || 0,
      currency: b.currency || 'USD',
      validityDays: b.validityDays || 30,
      jobPostsIncluded: b.jobPostsIncluded || 0,
      featuredJobsIncluded: b.featuredJobsIncluded || 0,
      urgentJobsIncluded: b.urgentJobsIncluded || 0,
      profileViewsIncluded: b.profileViewsIncluded || 0,
      resumeDownloadsIncluded: b.resumeDownloadsIncluded || 0,
      contactCreditsIncluded: b.contactCreditsIncluded || 0,
      isActive: Boolean(b.isActive),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Bundle name is required');
    setSaving(true);
    try {
      if (editingBundle) {
        await adminService.updateBundle(editingBundle._id, formData);
        toast.success('Bundle updated successfully');
      } else {
        await adminService.createBundle(formData);
        toast.success('Bundle created successfully');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete bundle "${b.name}"?`)) return;
    try {
      await adminService.deleteBundle(b._id);
      toast.success('Bundle deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete bundle');
    }
  };

  return (
    <DashboardLayout title="Service Bundles & Packages" subtitle="Package multiple hiring services into high-conversion discounted bundles" navItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Bundles combine job postings, contact credits, and featured tags into pre-packaged deals with custom validity.
          </p>
          <button onClick={handleOpenCreate} className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2 rounded-xl">
            <FaPlus className="h-3 w-3" /> Create Service Bundle
          </button>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-6 skeleton h-80" />)
          ) : bundles.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-muted">
              No packages defined. Click "Create Service Bundle" to add your first package.
            </div>
          ) : (
            bundles.map((b) => {
              const savings = b.originalPrice > b.price ? Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100) : 0;
              return (
                <div key={b._id} className="card p-6 flex flex-col justify-between relative hover:border-primary-500/40 transition-all">
                  {savings > 0 && (
                    <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <FaPercent className="h-2.5 w-2.5" /> Save {savings}%
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-xl text-ink">{b.name}</h3>
                    <p className="text-xs text-muted mt-1">{b.description}</p>

                    <div className="my-4 pb-4 border-b border-line flex items-baseline gap-2">
                      <span className="text-3xl font-black text-ink">{formatCurrency(b.price, b.currency)}</span>
                      {b.originalPrice > b.price && (
                        <span className="text-sm text-muted line-through">{formatCurrency(b.originalPrice, b.currency)}</span>
                      )}
                      <span className="text-xs text-muted ml-auto font-medium">
                        <FaClock className="inline h-3 w-3 mr-1" /> {b.validityDays} days validity
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-muted">
                      {b.jobPostsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Job Postings
                          </span>
                          <span className="font-bold text-ink">{b.jobPostsIncluded} posts</span>
                        </div>
                      )}
                      {b.featuredJobsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Featured Postings
                          </span>
                          <span className="font-bold text-ink">{b.featuredJobsIncluded}</span>
                        </div>
                      )}
                      {b.urgentJobsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Urgent Hiring Tags
                          </span>
                          <span className="font-bold text-ink">{b.urgentJobsIncluded}</span>
                        </div>
                      )}
                      {b.profileViewsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Profile Views
                          </span>
                          <span className="font-bold text-ink">{b.profileViewsIncluded}</span>
                        </div>
                      )}
                      {b.resumeDownloadsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Resume Downloads
                          </span>
                          <span className="font-bold text-ink">{b.resumeDownloadsIncluded}</span>
                        </div>
                      )}
                      {b.contactCreditsIncluded > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink font-medium">
                            <FaCheck className="text-emerald-500 h-3 w-3" /> Direct Contact Credits
                          </span>
                          <span className="font-bold text-primary-600">{b.contactCreditsIncluded}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 mt-6 border-t border-line">
                    <button onClick={() => handleOpenEdit(b)} className="btn-outline !py-2 flex-1 text-xs font-semibold">
                      <FaPen className="inline h-3 w-3 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(b)} className="btn-danger !py-2 px-3 text-xs" title="Delete Bundle">
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Bundle */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBundle ? 'Edit Bundle' : 'Create Service Bundle'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Bundle Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rapid Hiring Sprint Pack"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain package value..."
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Bundle Price ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Original Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1">Validity (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value, 10) || 30 })}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 bg-surface-sunken/40 rounded-xl border border-line space-y-3">
            <h4 className="font-bold text-xs uppercase text-ink">Included Package Quotas</h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Job Posts</label>
                <input
                  type="number"
                  min="0"
                  value={formData.jobPostsIncluded}
                  onChange={(e) => setFormData({ ...formData, jobPostsIncluded: parseInt(e.target.value, 10) || 0 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Featured Jobs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.featuredJobsIncluded}
                  onChange={(e) => setFormData({ ...formData, featuredJobsIncluded: parseInt(e.target.value, 10) || 0 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Urgent Tags</label>
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
                <label className="block text-[11px] font-bold text-muted mb-1">Profile Views</label>
                <input
                  type="number"
                  min="0"
                  value={formData.profileViewsIncluded}
                  onChange={(e) => setFormData({ ...formData, profileViewsIncluded: parseInt(e.target.value, 10) || 0 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Resume Downloads</label>
                <input
                  type="number"
                  min="0"
                  value={formData.resumeDownloadsIncluded}
                  onChange={(e) => setFormData({ ...formData, resumeDownloadsIncluded: parseInt(e.target.value, 10) || 0 })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1">Contact Credits</label>
                <input
                  type="number"
                  min="0"
                  value={formData.contactCreditsIncluded}
                  onChange={(e) => setFormData({ ...formData, contactCreditsIncluded: parseInt(e.target.value, 10) || 0 })}
                  className="input text-sm"
                />
              </div>
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
              Active and available for purchase
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : editingBundle ? 'Update Bundle' : 'Create Bundle'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminBundlesPage;
