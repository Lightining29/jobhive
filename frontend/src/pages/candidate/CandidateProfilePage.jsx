import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh,
  FaPlus, FaXmark, FaFileArrowUp, FaCircleCheck, FaGraduationCap, FaAward, FaGlobe, FaBolt,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { candidateService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { initials, formatAvatarUrl } from '../../utils/format';
import { SAMPLE_SKILLS } from '../../utils/constants';
import AIFillModal from '../../components/voice/AIFillModal';

const initialEducation = { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' };
const initialExperience = { role: '', company: '', startDate: '', endDate: '', current: false, description: '' };
const initialCertification = { name: '', issuer: '', year: '' };

const CandidateProfilePage = () => {
  const { setUser, refreshUser, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const skillInputRef = useRef(null);
  const [uploading, setUploading] = useState(null);
  const [aiFillOpen, setAiFillOpen] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: {
      name: '', headline: '', phone: '', bio: '',
      skills: [],
      education: [initialEducation],
      experience: [initialExperience],
      certifications: [initialCertification],
      socialLinks: { linkedin: '', github: '', portfolio: '' },
      preferences: {
        preferredLocations: [], preferredSalary: '', preferredWorkMode: '', preferredEmploymentType: '', preferredSalaryCurrency: 'USD', preferredJobTitle: '',
      },
    },
  });

  const educationArray = useFieldArray({ control, name: 'education' });
  const experienceArray = useFieldArray({ control, name: 'experience' });
  const certificationArray = useFieldArray({ control, name: 'certifications' });
  const skills = watch('skills');
  const preferences = watch('preferences');

  const load = useCallback(async () => {
    try {
      const { data } = await candidateService.profile();
      setProfile(data.profile);
      setCompletion(data.profileCompletion);
      const p = data.profile;
      reset({
        name: p.name || '',
        headline: p.headline || '',
        phone: p.phone || '',
        bio: p.bio || '',
        skills: p.skills || [],
        education: p.education?.length ? p.education : [initialEducation],
        experience: p.experience?.length ? p.experience : [initialExperience],
        certifications: p.certifications?.length ? p.certifications : [initialCertification],
        socialLinks: p.socialLinks || { linkedin: '', github: '', portfolio: '' },
        preferences: {
          preferredLocations: p.preferences?.preferredLocations || [],
          preferredSalary: p.preferences?.preferredSalary || '',
          preferredWorkMode: p.preferences?.preferredWorkMode || '',
          preferredEmploymentType: p.preferences?.preferredEmploymentType || '',
          preferredSalaryCurrency: p.preferences?.preferredSalaryCurrency || 'USD',
          preferredJobTitle: p.preferences?.preferredJobTitle || '',
        },
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    load();
  }, [load]);

  const addSkill = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const s = (skillInputRef.current?.value || '').trim().toLowerCase();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s)) {
      toast('Skill already added');
      return;
    }
    setValue('skills', [...skills, s], { shouldDirty: true });
    if (skillInputRef.current) skillInputRef.current.value = '';
  };

  const removeSkill = (idx, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValue('skills', skills.filter((_, i) => i !== idx), { shouldDirty: true });
  };

  const uploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('resume');
    try {
      const { data } = await candidateService.uploadResume(file);
      toast.success('Resume uploaded');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview so photo displays immediately
    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: localUrl }));
    if (setUser) setUser((prev) => prev ? { ...prev, avatar: localUrl } : { avatar: localUrl });

    setUploading('avatar');
    try {
      const res = await candidateService.uploadAvatar(file);
      toast.success('Profile photo updated successfully!');
      const newAvatar = res?.data?.avatar || res?.data?.user?.avatar || localUrl;
      setProfile((prev) => ({ ...prev, avatar: newAvatar }));
      if (setUser) {
        setUser((prev) => prev ? { ...prev, avatar: newAvatar } : { avatar: newAvatar });
      }
      if (refreshUser) await refreshUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile photo');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const cleaned = {
        ...values,
        avatar: profile?.avatar || undefined,
        skills: values.skills.filter(Boolean).map((s) => s.toLowerCase()),
        education: values.education.filter((e) => e.institution || e.degree),
        experience: values.experience.filter((e) => e.role || e.company),
        certifications: values.certifications.filter((c) => c.name),
        preferences: {
          ...values.preferences,
          preferredSalary: values.preferences.preferredSalary ? Number(values.preferences.preferredSalary) : null,
        },
      };
      const res = await candidateService.updateProfile(cleaned);
      if (res?.data?.user && setUser) {
        setUser((prev) => ({ ...prev, ...res.data.user }));
      }
      toast.success('Profile updated');
      await load();
      if (refreshUser) await refreshUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── AI Fill — merge extracted fields into the form ───────────────────────
  const handleAIFill = useCallback((extracted) => {
    if (!extracted) return;

    if (extracted.name)     setValue('name', extracted.name);
    if (extracted.headline) setValue('headline', extracted.headline);
    if (extracted.phone)    setValue('phone', extracted.phone);
    if (extracted.bio)      setValue('bio', extracted.bio);

    if (extracted.skills?.length) {
      const current = watch('skills') || [];
      const merged  = [...new Set([...current, ...extracted.skills])];
      setValue('skills', merged);
    }

    if (extracted.experience?.length) {
      // Replace placeholder empty rows, keep any real existing entries
      const current = watch('experience') || [];
      const hasReal = current.some((e) => e.role || e.company);
      setValue('experience', hasReal ? [...current, ...extracted.experience] : extracted.experience);
    }

    if (extracted.education?.length) {
      const current = watch('education') || [];
      const hasReal = current.some((e) => e.institution || e.degree);
      setValue('education', hasReal ? [...current, ...extracted.education] : extracted.education);
    }

    if (extracted.certifications?.length) {
      const current = watch('certifications') || [];
      const hasReal = current.some((c) => c.name);
      setValue('certifications', hasReal ? [...current, ...extracted.certifications] : extracted.certifications);
    }

    if (extracted.socialLinks) {
      const cur = watch('socialLinks') || {};
      setValue('socialLinks', {
        linkedin:  extracted.socialLinks.linkedin  || cur.linkedin  || '',
        github:    extracted.socialLinks.github    || cur.github    || '',
        portfolio: extracted.socialLinks.portfolio || cur.portfolio || '',
      });
    }

    if (extracted.preferences) {
      const cur = watch('preferences') || {};
      setValue('preferences', {
        ...cur,
        ...Object.fromEntries(
          Object.entries(extracted.preferences).filter(([, v]) => v !== null && v !== undefined && v !== '')
        ),
      });
    }
  }, [setValue, watch]);

  const navItems = [
    { to: '/candidate/dashboard',    label: 'Overview',        icon: FaGaugeHigh },
    { to: '/candidate/profile',      label: 'My Profile',      icon: FaUser },
    { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles },
    { to: '/candidate/recommended',  label: 'Recommended Jobs',icon: FaBolt },
    { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
    { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
    { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  ];

  const SubCard = ({ title, children }) => (
    <div className="card p-5 md:p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) return <DashboardLayout title="My Profile" navItems={navItems}><div className="card p-8 skeleton h-96" /></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile" subtitle="Complete your profile for better job matches" navItems={navItems}>
      {/* AI Fill Modal */}
      <AIFillModal
        isOpen={aiFillOpen}
        onClose={() => setAiFillOpen(false)}
        onFill={handleAIFill}
      />

      {/* AI Fill Banner */}
      <div className="card p-4 mb-5 flex items-center justify-between gap-4 bg-gradient-to-r from-primary-50 to-violet-50 border-primary-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <FaWandMagicSparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Fill profile with AI</p>
            <p className="text-xs text-muted">Describe yourself and AI fills everything automatically</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAiFillOpen(true)}
          className="btn-primary shrink-0 !py-2"
        >
          <FaWandMagicSparkles className="h-3.5 w-3.5" />
          Try AI Fill
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <SubCard title="Basics">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative shrink-0">
              {profile?.avatar || user?.avatar ? (
                <img
                  src={formatAvatarUrl(profile?.avatar || user?.avatar)}
                  alt={profile?.name || user?.name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary-500 shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`h-20 w-20 rounded-full items-center justify-center text-2xl font-black bg-primary-50 border-2 border-primary-300 text-primary-700 ${
                  profile?.avatar || user?.avatar ? 'hidden' : 'flex'
                }`}
              >
                {initials(profile?.name || user?.name || 'User')}
              </div>
              <label
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110 bg-primary-600 text-white hover:bg-primary-700"
              >
                <FaPlus className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={uploading === 'avatar'}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{profile?.name}</p>
              <p className="text-sm text-muted">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge bg-primary-50 text-yellow-800 border border-accent">Candidate</span>
                {profile?.emailVerified && <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200"><FaCircleCheck className="h-3 w-3" /> Verified</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-extrabold text-primary">{completion}%</p>
              <p className="text-xs text-muted">complete</p>
              <div className="h-1.5 w-28 bg-gray-100 rounded-full mt-1 ml-auto overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" {...register('name')} />
            </div>
            <div>
              <label className="label">Headline</label>
              <input className="input" placeholder="e.g. Full Stack Developer" {...register('headline')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('phone')} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea rows={3} className="input" {...register('bio')} />
            </div>
          </div>
        </SubCard>

        <SubCard title="Skills">
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className="badge bg-primary-50 text-yellow-800 border border-accent py-1.5 flex items-center">
                {s}
                <button type="button" onClick={(e) => removeSkill(i, e)} className="ml-1.5 hover:text-red-500 cursor-pointer">
                  <FaXmark className="h-3 w-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && <span className="text-sm text-muted">Add at least 3 skills for AI matching.</span>}
          </div>
          <div className="flex gap-2">
            <input
              ref={skillInputRef}
              type="text"
              defaultValue=""
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  addSkill(e);
                }
              }}
              placeholder="Add a skill (e.g. React, Node.js, Python)..."
              className="input"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addSkill(e);
              }}
              className="btn-outline shrink-0 cursor-pointer"
            >
              <FaPlus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SAMPLE_SKILLS.slice(0, 12).map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const low = s.toLowerCase();
                  if (!skills.includes(low)) {
                    setValue('skills', [...skills, low], { shouldDirty: true });
                  }
                }}
                className="badge bg-gray-50 text-muted border border-line hover:border-accent hover:text-primary py-1 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </SubCard>

        <SubCard title="Work Experience">
          {experienceArray.fields.map((field, i) => (
            <div key={field.id} className="border border-line rounded-xl p-4 mb-4 relative">
              <button type="button" onClick={() => experienceArray.remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><FaXmark /></button>
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className="label">Role</label><input className="input" {...register(`experience.${i}.role`)} /></div>
                <div><label className="label">Company</label><input className="input" {...register(`experience.${i}.company`)} /></div>
                <div><label className="label">Start date</label><input type="date" className="input" {...register(`experience.${i}.startDate`)} /></div>
                <div><label className="label">End date</label><input type="date" className="input" disabled={watch(`experience.${i}.current`)} {...register(`experience.${i}.endDate`)} /></div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-yellow-500" {...register(`experience.${i}.current`)} /> <span className="text-sm">I currently work here</span>
                </div>
                <div className="md:col-span-2"><label className="label">Description</label><textarea rows={2} className="input" {...register(`experience.${i}.description`)} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => experienceArray.append(initialExperience)} className="btn-outline text-sm"><FaPlus className="h-3.5 w-3.5" /> Add Experience</button>
        </SubCard>

        <SubCard title="Education">
          {educationArray.fields.map((field, i) => (
            <div key={field.id} className="border border-line rounded-xl p-4 mb-4 relative">
              <button type="button" onClick={() => educationArray.remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><FaXmark /></button>
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className="label">Institution</label><input className="input" {...register(`education.${i}.institution`)} /></div>
                <div><label className="label">Degree</label><input className="input" {...register(`education.${i}.degree`)} /></div>
                <div><label className="label">Field of study</label><input className="input" {...register(`education.${i}.fieldOfStudy`)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Start year</label><input className="input" {...register(`education.${i}.startYear`)} /></div>
                  <div><label className="label">End year</label><input className="input" {...register(`education.${i}.endYear`)} /></div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => educationArray.append(initialEducation)} className="btn-outline text-sm"><FaPlus className="h-3.5 w-3.5" /> Add Education</button>
        </SubCard>

        <SubCard title="Certifications">
          {certificationArray.fields.map((field, i) => (
            <div key={field.id} className="border border-line rounded-xl p-4 mb-4 relative">
              <button type="button" onClick={() => certificationArray.remove(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><FaXmark /></button>
              <div className="grid md:grid-cols-3 gap-3">
                <div><label className="label">Name</label><input className="input" {...register(`certifications.${i}.name`)} /></div>
                <div><label className="label">Issuer</label><input className="input" {...register(`certifications.${i}.issuer`)} /></div>
                <div><label className="label">Year</label><input className="input" {...register(`certifications.${i}.year`)} /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => certificationArray.append(initialCertification)} className="btn-outline text-sm"><FaPlus className="h-3.5 w-3.5" /> Add Certification</button>
        </SubCard>

        <SubCard title="Social Links">
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="label">LinkedIn</label><input className="input" placeholder="https://linkedin.com/in/..." {...register('socialLinks.linkedin')} /></div>
            <div><label className="label">GitHub</label><input className="input" placeholder="https://github.com/..." {...register('socialLinks.github')} /></div>
            <div><label className="label">Portfolio</label><input className="input" placeholder="https://..." {...register('socialLinks.portfolio')} /></div>
          </div>
        </SubCard>

        <SubCard title="Job Preferences (for AI matching)">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Preferred job title / role</label>
              <input className="input" placeholder="e.g. Frontend Developer, Product Manager, Data Analyst" {...register('preferences.preferredJobTitle')} />
              <p className="text-xs text-muted mt-1">Jobs matching this title will appear first in your feed</p>
            </div>
            <div>
              <label className="label">Preferred locations</label>
              <input className="input" placeholder="e.g. San Francisco, New York, Remote" value={(preferences.preferredLocations || []).join(', ')} onChange={(e) => setValue('preferences.preferredLocations', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
            </div>
            <div>
              <label className="label">Preferred salary (per year)</label>
              <div className="flex gap-2">
                <input type="number" className="input" placeholder="100000" {...register('preferences.preferredSalary')} />
                <select className="input !w-24" {...register('preferences.preferredSalaryCurrency')}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Preferred work mode</label>
              <select className="input" {...register('preferences.preferredWorkMode')}>
                <option value="">Any</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="label">Preferred employment type</label>
              <select className="input" {...register('preferences.preferredEmploymentType')}>
                <option value="">Any</option><option value="full-time">Full-Time</option><option value="part-time">Part-Time</option><option value="contract">Contract</option><option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </SubCard>

        <div className="flex justify-end gap-3">
          <Link to="/candidate/dashboard" className="btn-outline">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary !px-8">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CandidateProfilePage;
