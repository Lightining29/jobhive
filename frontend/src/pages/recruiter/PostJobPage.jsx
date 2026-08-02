import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FaBuilding, FaBriefcase, FaUsers, FaGaugeHigh, FaPlus, FaCircleCheck } from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { recruiterService } from '../../services';

const navItems = [
  { to: '/recruiter/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/recruiter/company', label: 'Company Profile', icon: FaBuilding },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: FaPlus },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: FaBriefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: FaUsers },
];

const SKILLS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'Spring Boot', 'MongoDB', 'SQL', 'Python', 'Django', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'UI/UX', 'QA', 'Sales', 'Marketing', 'HR', 'Communication', 'Customer Service', 'Project Management', 'SEO', 'Finance', 'Accounting'];

const PostJobPage = ({ editJob }) => {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      jobTitle: editJob?.jobTitle || '',
      description: editJob?.description || '',
      location: editJob?.location || '',
      city: editJob?.city || '',
      state: editJob?.state || '',
      country: editJob?.country || '',
      workMode: editJob?.workMode || 'onsite',
      employmentType: editJob?.employmentType || 'full-time',
      experienceLevel: editJob?.experienceLevel || 'mid',
      experienceMin: editJob?.experience?.min ?? 0,
      experienceMax: editJob?.experience?.max ?? 5,
      salaryMin: editJob?.salaryMin || '',
      salaryMax: editJob?.salaryMax || '',
      currency: editJob?.currency || 'USD',
      salaryPeriod: editJob?.salaryPeriod || 'yearly',
      industry: editJob?.industry || '',
      applicationUrl: editJob?.applicationUrl || '',
      applicationEmail: editJob?.applicationEmail || '',
      requiredSkills: editJob?.requiredSkills || [],
      expiresInDays: 30,
    },
  });

  const skills = watch('requiredSkills');

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s)) return;
    setValue('requiredSkills', [...skills, s]);
    setSkillInput('');
  };

  const onSubmit = useCallback(
    async (values) => {
      try {
        if (editJob) {
          await recruiterService.updateJob(editJob._id, values);
          toast.success('Job updated');
        } else {
          await recruiterService.postJob(values);
          toast.success('Job posted! Pending verification.');
        }
        navigate('/recruiter/my-jobs');
      } catch (err) {
        toast.error(err.message);
      }
    },
    [editJob, navigate]
  );

  return (
    <DashboardLayout title={editJob ? 'Edit Job' : 'Post a Job'} subtitle="Reach thousands of qualified candidates" navItems={navItems}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-4xl">
        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Job Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Job title *</label>
              <input className="input" placeholder="e.g. Senior React Developer" {...register('jobTitle', { required: 'Job title is required' })} />
              {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="label">Job description *</label>
              <textarea rows={8} className="input" placeholder="Describe the role, responsibilities, and requirements (min 30 characters)..." {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Min 30 characters' } })} />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="label">Work mode</label>
              <select className="input" {...register('workMode')}>
                <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="label">Employment type</label>
              <select className="input" {...register('employmentType')}>
                <option value="full-time">Full-Time</option><option value="part-time">Part-Time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="label">Experience level</label>
              <select className="input" {...register('experienceLevel')}>
                <option value="internship">Internship</option><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="mid">Mid</option><option value="senior">Senior</option><option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" placeholder="e.g. Software" {...register('industry')} />
            </div>
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Location</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label">Full location *</label><input className="input" placeholder="e.g. San Francisco, CA, USA" {...register('location', { required: 'Location is required' })} /></div>
            <div><label className="label">City</label><input className="input" {...register('city')} /></div>
            <div><label className="label">State</label><input className="input" {...register('state')} /></div>
            <div><label className="label">Country</label><input className="input" {...register('country')} /></div>
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Compensation</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="label">Salary min</label><input type="number" className="input" {...register('salaryMin')} /></div>
            <div><label className="label">Salary max</label><input type="number" className="input" {...register('salaryMax')} /></div>
            <div><label className="label">Currency</label><select className="input" {...register('currency')}><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option></select></div>
            <div><label className="label">Period</label><select className="input" {...register('salaryPeriod')}><option value="yearly">Yearly</option><option value="monthly">Monthly</option><option value="hourly">Hourly</option></select></div>
            <div><label className="label">Experience min (yrs)</label><input type="number" className="input" {...register('experienceMin')} /></div>
            <div><label className="label">Experience max (yrs)</label><input type="number" className="input" {...register('experienceMax')} /></div>
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className="badge bg-primary-50 text-yellow-800 border border-accent py-1.5">
                {s}
                <button type="button" onClick={() => setValue('requiredSkills', skills.filter((_, x) => x !== i))} className="ml-1 text-xs hover:text-red-500">x</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill..." className="input" />
            <button type="button" onClick={addSkill} className="btn-outline shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SKILLS.slice(0, 15).map((s) => (
              <button key={s} type="button" onClick={() => setValue('requiredSkills', skills.includes(s.toLowerCase()) ? skills : [...skills, s.toLowerCase()])} className="badge bg-gray-50 text-muted border border-line hover:border-accent hover:text-primary py-1">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <h3 className="font-bold mb-4">Application Settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">External application URL</label><input className="input" placeholder="https://..." {...register('applicationUrl')} /></div>
            <div><label className="label">Application email</label><input type="email" className="input" placeholder="hr@company.com" {...register('applicationEmail')} /></div>
            <div>
              <label className="label">Auto-expire after (days)</label>
              <input type="number" className="input" {...register('expiresInDays')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary !px-8">
            {isSubmitting ? 'Saving...' : editJob ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default PostJobPage;
