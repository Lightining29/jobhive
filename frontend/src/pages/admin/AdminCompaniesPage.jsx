import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaBuilding, FaBriefcase, FaFlag, FaGaugeHigh, FaCircleCheck, FaClockRotateLeft } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminService } from '../../services';
import { formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/companies', label: 'Companies', icon: FaBuilding },
  { to: '/admin/jobs', label: 'Jobs', icon: FaBriefcase },
  { to: '/admin/reports', label: 'Reports', icon: FaFlag },
];

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.companies({ page: 1, limit: 50, search: search || undefined });
      setCompanies(data.companies);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [load]);

  const toggleVerify = async (company) => {
    try {
      await adminService.verifyCompany(company._id, !company.verified);
      toast.success(company.verified ? 'Verification revoked' : 'Company verified');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Company Management" subtitle="Verify and manage companies" navItems={navItems}>
      <div className="mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="input !w-72" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-5 skeleton h-20" />)}</div>
      ) : companies.length === 0 ? (
        <div className="card p-10 text-center text-muted"><FaBuilding className="h-10 w-10 mx-auto mb-3 text-gray-300" /><p>No companies found.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-line text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Company</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Owner</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Industry</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Joined</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {companies.map((c) => (
                <tr key={c._id} className="hover:bg-primary-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.logo?.url ? <img src={c.logo.url} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary"><FaBuilding /></span>}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{c.name}</p>
                        {c.headquarters && <p className="text-xs text-muted">{c.headquarters}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.owner?.name || '-'}</p>
                    <p className="text-xs text-muted">{c.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.industry || '-'}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge border ${c.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      {c.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVerify(c)} className={`btn ${c.verified ? 'btn-outline' : 'btn-primary'} !py-1.5 text-xs`}>
                      {c.verified ? <FaClockRotateLeft className="h-3 w-3" /> : <FaCircleCheck className="h-3 w-3" />}
                      {c.verified ? 'Revoke' : 'Verify'}
                    </button>
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

export default AdminCompaniesPage;
