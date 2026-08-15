import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaUserShield,
  FaPlus,
  FaPen,
  FaShield,
  FaCheck,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatDateTime } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Admin (Full Access to Everything)' },
  { value: 'finance_admin', label: 'Finance Admin (Payments, Subscriptions, Reports)' },
  { value: 'job_moderator', label: 'Job Moderator (Jobs, Companies, Flagged Content)' },
  { value: 'support_admin', label: 'Support Admin (User Management & Inquiries)' },
  { value: 'marketing_admin', label: 'Marketing Admin (Coupons, Bundles, Broadcasts)' },
];

const ALL_MODULES = [
  'services', 'plans', 'coupons', 'bundles', 'users', 'jobs', 'companies',
  'payments', 'reports', 'settings', 'roles', 'notifications',
];

const AdminRolesPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [roleData, setRoleData] = useState({
    adminRole: 'support_admin',
    permissions: [],
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.roles({ limit: 50 });
      setStaff(data.staff || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load admin staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenEdit = (user) => {
    setEditingStaff(user);
    setRoleData({
      adminRole: user.adminRole || 'support_admin',
      permissions: user.permissions || [],
    });
    setModalOpen(true);
  };

  const handleTogglePerm = (mod) => {
    setRoleData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(mod)
        ? prev.permissions.filter((p) => p !== mod)
        : [...prev.permissions, mod],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateRole(editingStaff._id, roleData);
      toast.success('Admin permissions updated');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Admin Roles & Permissions" subtitle="Assign fine-grained access control to your platform moderation and finance teams" navItems={adminNavItems}>
      <div className="space-y-6">
        <p className="text-sm text-muted">
          Configure role assignments. Super Admins hold global control over the system, while Finance, Moderator, Support, and Marketing admins operate with tailored access matrices.
        </p>

        {/* Staff Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">Admin Staff Member</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Granted Module Permissions</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted">Loading admin staff...</td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted">No admin accounts found.</td>
                  </tr>
                ) : (
                  staff.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <FaUserShield className="text-primary-500 h-3.5 w-3.5" /> {u.name}
                        </div>
                        <div className="text-xs text-muted font-mono">{u.email}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="badge badge-primary text-[11px] capitalize font-bold">
                          {(u.adminRole || 'Super Admin').replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {u.adminRole === 'super_admin' || !u.adminRole ? (
                            <span className="badge badge-success text-[10px]">All Modules (*)</span>
                          ) : (
                            (u.permissions || []).map((p) => (
                              <span key={p} className="badge badge-neutral text-[10px] capitalize">
                                {p}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-muted">{formatDateTime(u.updatedAt)}</td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn-outline !py-1.5 !px-3 text-xs rounded-lg font-semibold"
                        >
                          <FaPen className="inline mr-1" /> Edit Permissions
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Edit Staff Role */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Configure Role: ${editingStaff?.name}`}>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Administrative Role</label>
            <select
              value={roleData.adminRole}
              onChange={(e) => setRoleData({ ...roleData, adminRole: e.target.value })}
              className="input text-sm"
            >
              {ADMIN_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-2">Module Permission Matrix</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-surface-sunken/40 rounded-xl border border-line">
              {ALL_MODULES.map((mod) => (
                <label key={mod} className="flex items-center gap-2 text-xs font-medium cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={roleData.adminRole === 'super_admin' || roleData.permissions.includes(mod)}
                    disabled={roleData.adminRole === 'super_admin'}
                    onChange={() => handleTogglePerm(mod)}
                    className="rounded border-line"
                  />
                  {mod.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : 'Update Permissions'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminRolesPage;
