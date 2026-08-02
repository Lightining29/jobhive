import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBuilding, FaBriefcase, FaFlag, FaShield, FaGaugeHigh, FaUserXmark } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminService } from '../../services';
import { useSearchParams } from 'react-router-dom';
import { formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/companies', label: 'Companies', icon: FaBuilding },
  { to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FaFlag },
];

const AdminUsersPage = () => {
  const [params] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(params.get('role') || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.users({ page: 1, limit: 50, role: role || undefined, search: search || undefined });
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [load]);

  const toggleSuspend = async (user) => {
    const action = user.status === 'active' ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    try {
      await adminService.updateUser(user._id, { status: user.status === 'active' ? 'suspended' : 'active' });
      toast.success(`User ${action}ed`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage all platform users" navItems={navItems}>
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input !w-72" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input !w-auto">
          <option value="">All roles</option>
          <option value="candidate">Candidates</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-5 skeleton h-20" />)}</div>
      ) : users.length === 0 ? (
        <div className="card p-10 text-center text-muted"><FaUsers className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p>No users found.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-line text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">User</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Role</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Joined</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Verified</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-primary-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">{u.name?.charAt(0)?.toUpperCase()}</span>}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.name}</p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="badge bg-gray-100 text-muted border border-line capitalize">{u.role}</span></td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(u.createdAt)}</td>
                  <td className="px-4 py-3">{u.emailVerified ? <span className="text-emerald-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleSuspend(u)} className="btn-danger !py-1.5 text-xs">
                        <FaUserXmark className="h-3 w-3" /> {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
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

export default AdminUsersPage;
