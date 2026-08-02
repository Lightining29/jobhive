import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FaBuilding, FaBriefcase, FaUsers, FaGaugeHigh, FaPlus, FaCircleCheck, FaFileCircleCheck } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { recruiterService } from '../../services';

const navItems = [
  { to: '/recruiter/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/recruiter/company', label: 'Company Profile', icon: FaBuilding },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: FaPlus },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: FaBriefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: FaUsers },
];

const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [hasCompany, setHasCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '', website: '', description: '', industry: '', size: '', foundedYear: '',
      headquarters: '', country: '', city: '', email: '', phone: '',
      socialLinks: { linkedin: '', twitter: '', facebook: '' },
    },
  });

  const load = useCallback(async () => {
    try {
      const { data } = await recruiterService.company();
      setCompany(data.company);
      setHasCompany(true);
      const c = data.company;
      reset({
        name: c.name || '',
        website: c.website || '',
        description: c.description || '',
        industry: c.industry || '',
        size: c.size || '',
        foundedYear: c.foundedYear || '',
        headquarters: c.headquarters || '',
        country: c.country || '',
        city: c.city || '',
        email: c.email || '',
        phone: c.phone || '',
        socialLinks: c.socialLinks || { linkedin: '', twitter: '', facebook: '' },
      });
    } catch (err) {
      if (err.message?.toLowerCase().includes('company')) {
        setHasCompany(false);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (hasCompany) {
        await recruiterService.updateCompany(values);
        toast.success('Company updated');
      } else {
        await recruiterService.registerCompany(values);
        toast.success('Company registered! Pending verification.');
      }
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await recruiterService.uploadLogo(file);
      toast.success('Logo uploaded');
      setCompany(data.company);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <DashboardLayout title="Company Profile" navItems={navItems}><div className="card p-8 skeleton h-96" /></DashboardLayout>;

  return (
    <DashboardLayout
      title="Company Profile"
      subtitle={hasCompany ? 'Manage your company information' : 'Register your company to post jobs'}
      navItems={navItems}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {company && (
          <div className="card p-5 flex flex-wrap items-center gap-4">
            <div className="relative">
              {company.logo?.url ? (
                <img src={company.logo.url} alt="" className="h-16 w-16 rounded-2xl object-cover border border-line" />
              ) : (
                <span className="h-16 w-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary"><FaBuilding className="h-8 w-8" /></span>
              )}
              <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-ink text-white flex items-center justify-center cursor-pointer">
                <FaPlus className="h-3 w-3" />
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={uploading} />
              </label>
            </div>
            <div className="flex-1">
              <p className="font-bold">{company.name}</p>
              {company.verified ? (
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200"><FaCircleCheck className="h-3 w-3" /> Verified</span>
              ) : (
                <span className="badge bg-orange-50 text-orange-700 border border-orange-200">Pending verification</span>
              )}
            </div>
          </div>
        )}

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Company Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Company name *</label><input className="input" {...register('name', { required: true })} /></div>
            <div><label className="label">Website</label><input className="input" placeholder="https://example.com" {...register('website')} /></div>
            <div className="md:col-span-2"><label className="label">Description</label><textarea rows={4} className="input" {...register('description')} /></div>
            <div><label className="label">Industry</label><input className="input" placeholder="e.g. Software, SaaS, Finance" {...register('industry')} /></div>
            <div>
              <label className="label">Company size</label>
              <select className="input" {...register('size')}>
                <option value="">Select size</option>
                <option value="1-10">1-10</option><option value="11-50">11-50</option><option value="51-200">51-200</option>
                <option value="201-500">201-500</option><option value="501-1000">501-1000</option><option value="1000+">1000+</option>
              </select>
            </div>
            <div><label className="label">Founded year</label><input type="number" className="input" {...register('foundedYear')} /></div>
            <div><label className="label">Headquarters</label><input className="input" placeholder="City, Country" {...register('headquarters')} /></div>
            <div><label className="label">Country</label><input className="input" {...register('country')} /></div>
            <div><label className="label">City</label><input className="input" {...register('city')} /></div>
            <div><label className="label">Contact email</label><input type="email" className="input" {...register('email')} /></div>
            <div><label className="label">Phone</label><input className="input" {...register('phone')} /></div>
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Social Links</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="label">LinkedIn</label><input className="input" {...register('socialLinks.linkedin')} /></div>
            <div><label className="label">Twitter</label><input className="input" {...register('socialLinks.twitter')} /></div>
            <div><label className="label">Facebook</label><input className="input" {...register('socialLinks.facebook')} /></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary !px-8">
            {saving ? 'Saving...' : hasCompany ? 'Update Company' : 'Register Company'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CompanyProfilePage;
