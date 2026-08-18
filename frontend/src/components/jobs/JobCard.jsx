import React from 'react';
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCircleCheck,
  FaClock,
  FaGlobe,
  FaLocationDot,
  FaSackDollar,
  FaSuitcase,
  FaStar,
} from 'react-icons/fa6';
import { FaBookmark, FaRegBookmark, FaRegBuilding } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import {
  capitalize,
  formatSkillName,
  EMPLOYMENT_LABELS,
  formatSalary,
  initials,
  matchColor,
  timeAgo,
} from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { ParallaxCard } from '../ui/ParallaxCard';

const cleanHtml = (text) =>
  (text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/^[A-Z]{2,5}\d{3,8}[A-Z]?\d*\s*/i, '')
    .replace(/^(?:req|jb|jr|jid|position\s*id|job\s*id|requisition)\s*[:#]?\s*\d+\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const parseJobDescription = (raw) => {
  const text = cleanHtml(raw);
  if (!text) return null;

  const sections = { summary: '', responsibilities: '', requirements: '', skills: '' };

  // Extract summary: first 1-2 sentences before any section header
  const sectionHeaders = /(?:key\s+responsibilities|about\s+(?:the\s+)?(?:role|job|position|us|company)|your\s+(?:role|responsibilities)|requirements?|qualifications?|skills?\s+required|what\s+you['']?ll\s+do|what\s+we['']?re\s+looking\s+for|who\s+we\s+are|we\s+are\s+looking\s+for|experience|education|perks|benefits|salary|compensation|about\s+the\s+company)/i;
  const firstSection = text.search(sectionHeaders);
  const summaryText = firstSection > 0 ? text.substring(0, firstSection) : text.substring(0, 300);
  sections.summary = summaryText.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ').substring(0, 200);

  // Extract responsibilities
  const respMatch = text.match(/(?:key\s+responsibilities|what\s+you['']?ll\s+do|your\s+responsibilities|about\s+the\s+(?:role|job|position))\s*:?\s*([\s\S]*?)(?:requirements?|qualifications?|skills?\s+required|what\s+we['']?re\s+looking\s+for|who\s+we\s+are|experience|perks|benefits|$)/i);
  if (respMatch) {
    const items = respMatch[1].split(/\n|\d+\.\s+|[•·▪]\s+/).map(s => s.trim()).filter(s => s.length > 5 && s.length < 150);
    sections.responsibilities = items.slice(0, 3).join(' • ');
  }

  // Extract requirements / experience
  const reqMatch = text.match(/(?:requirements?|qualifications?|experience|what\s+we['']?re\s+looking\s+for|we\s+are\s+looking\s+for)\s*:?\s*([\s\S]*?)(?:skills?\s+required|perks|benefits|salary|compensation|about\s+the\s+company|$)/i);
  if (reqMatch) {
    const items = reqMatch[1].split(/\n|\d+\.\s+|[•·▪]\s+/).map(s => s.trim()).filter(s => s.length > 5 && s.length < 150);
    sections.requirements = items.slice(0, 3).join(' • ');
  }

  // Extract skills
  const skillMatch = text.match(/(?:skills?\s+required|required\s+skills?|key\s+skills?|technologies?|tools?)\s*:?\s*([\s\S]*?)(?:perks|benefits|salary|compensation|about|experience|requirements|$)/i);
  if (skillMatch) {
    const items = skillMatch[1].split(/\n|[•·▪,;]\s+/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 2 && s.length < 60);
    sections.skills = items.slice(0, 4).join(', ');
  }

  return sections;
};

export const CompanyLogo = ({ logo, name, size = 'md', className = '' }) => {
  const sizes = { sm: 'h-9 w-9 rounded-lg', md: 'h-12 w-12 rounded-xl', lg: 'h-16 w-16 rounded-2xl' };
  const textSizes = { sm: 'text-[11px]', md: 'text-sm', lg: 'text-2xl' };
  const [imgError, setImgError] = React.useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name ? `${name} company logo - Hiring on Job Workplace` : 'Company Logo - Job Workplace'}
        loading="lazy"
        onError={() => setImgError(true)}
        className={`${sizes[size]} object-cover border border-line bg-white shadow-sm ${className}`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 ${className}`}>
      {name ? (
        <span className={`${textSizes[size]} font-bold text-ink leading-none`}>{initials(name)}</span>
      ) : (
        <FaBuilding className={size === 'lg' ? 'h-6 w-6 text-ink' : 'h-4 w-4 text-ink'} />
      )}
    </div>
  );
};

const WORK_MODE_BADGES = {
  remote: { label: 'Remote', icon: FaGlobe, cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  hybrid: { label: 'Hybrid', icon: FaBuilding, cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  onsite: { label: 'On-site', icon: FaLocationDot, cls: 'bg-sky-50 text-sky-700 border border-sky-200' },
};

const SOURCE_LABELS = {
  recruiter: 'JobHive',
  adzuna: 'Adzuna',
  arbeitnow: 'Arbeitnow',
  remotive: 'Remotive',
  muse: 'The Muse',
  jooble: 'Jooble',
  himalayas: 'Himalayas',
  jobicy: 'Jobicy',
  greenhouse: 'Company Careers',
  amazon: 'Amazon Careers',
  ashby: 'Ashby Careers',
  internshala: 'Internshala',
};

const SOURCE_DOT_COLORS = {
  recruiter: 'bg-accent-dark',
  adzuna: 'bg-sky-400',
  arbeitnow: 'bg-emerald-400',
  remotive: 'bg-indigo-400',
  muse: 'bg-pink-400',
  jooble: 'bg-amber-400',
  himalayas: 'bg-violet-400',
  jobicy: 'bg-cyan-400',
  greenhouse: 'bg-rose-400',
  amazon: 'bg-orange-400',
  ashby: 'bg-teal-400',
  internshala: 'bg-blue-500',
};

const JobCard = ({ job, match }) => {
  if (!job || typeof job !== 'object') return null;

  const { user, savedJobs, toggleSaved } = useAuth();
  const isSaved = Array.isArray(savedJobs) && savedJobs.some((j) => j?._id === job?._id);
  const showSave = user && user.role === 'candidate';

  const workMode =
    (job.workMode && WORK_MODE_BADGES[job.workMode] && job.workMode) ||
    (job.remote ? 'remote' : '') ||
    (job.hybrid ? 'hybrid' : '') ||
    (job.onsite ? 'onsite' : '');

  const employment = EMPLOYMENT_LABELS[job.employmentType] || (job.employmentType && capitalize(job.employmentType));

  const sourceLabel = SOURCE_LABELS[job.source] || (job.source && capitalize(job.source));

  const location =
    job.location ||
    [job.city, job.country].filter(Boolean).join(', ') ||
    (workMode === 'remote' ? 'Remote' : 'Location on request');

  const salary = formatSalary(job);
  const hasSalary = salary !== 'Salary not disclosed';

  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills.filter(Boolean) : [];
  const shownSkills = skills.slice(0, 4);
  const extraSkills = skills.length - shownSkills.length;

  const showMatch = typeof match === 'number';

  return (
    <ParallaxCard maxRotation={5} scale={1.015} className="h-full">
      <div className="card card-hover p-5 flex flex-col h-full bg-white dark:bg-[#080C1B]/90 dark:neon-acrylic-pink dark:border-pink-500/60 dark:hover:border-cyan-400 dark:hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 rounded-[24px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-0.5 rounded-full dark:neon-avatar-ring-pink shrink-0">
              <CompanyLogo logo={job.companyLogo} name={job.companyName} />
            </div>
            <div className="min-w-0">
              <Link
                to={`/jobs/${job._id}`}
                className="block font-black text-slate-900 dark:text-white leading-snug hover:text-primary-600 dark:hover:neon-text-pink transition-all"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {job.jobTitle}
              </Link>
              <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/25 dark:border-amber-400/30 px-2 py-0.5 rounded-md mt-1 line-clamp-1 max-w-full">
                {job.headline && job.headline.trim() ? job.headline : `${job.jobTitle}${job.companyName ? ` at ${job.companyName}` : ''}`}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 min-w-0">
                <FaRegBuilding className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.companyName}</span>
                {job.isVerified && (
                  <FaCircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" title="Verified employer" />
                )}
              </p>
            </div>
          </div>
          {showSave && (
            <button
              onClick={() => toggleSaved(job._id)}
              className={`shrink-0 p-2 rounded-lg transition-colors ${isSaved ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              {isSaved ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {workMode && (() => {
            const ModeIcon = WORK_MODE_BADGES[workMode].icon;
            return (
              <span className={`badge ${WORK_MODE_BADGES[workMode].cls} dark:bg-slate-800 dark:border-slate-700`}>
                <ModeIcon className="h-2.5 w-2.5" />
                {WORK_MODE_BADGES[workMode].label}
              </span>
            );
          })()}
          {employment && (
            <span className="badge border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              <FaBriefcase className="h-2.5 w-2.5" />
              {employment}
            </span>
          )}
          {job.experienceLevel && (
            <span className="badge border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              {capitalize(job.experienceLevel)}
            </span>
          )}
          {sourceLabel && (
            <span className="badge border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <span className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT_COLORS[job.source] || 'bg-slate-300'}`} />
              {sourceLabel}
            </span>
          )}
        </div>

        {job.description && (() => {
          const desc = parseJobDescription(job.description);
          if (!desc) return null;
          const hasContent = desc.summary || desc.responsibilities || desc.requirements || desc.skills;
          if (!hasContent) return null;
          return (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {desc.summary && (
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                  {desc.summary}
                </p>
              )}
              {desc.responsibilities && (
                <div className="flex items-start gap-1.5">
                  <FaSuitcase className="h-3 w-3 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-1">
                    {desc.responsibilities}
                  </p>
                </div>
              )}
              {desc.requirements && (
                <div className="flex items-start gap-1.5">
                  <FaStar className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-1">
                    {desc.requirements}
                  </p>
                </div>
              )}
              {desc.skills && (
                <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                  {desc.skills}
                </p>
              )}
            </div>
          );
        })()}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-1.5">
            {hasSalary && <FaSackDollar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            <span className={`text-base font-bold ${hasSalary ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{salary}</span>
            {hasSalary && <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ year</span>}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2 min-w-0">
            <FaLocationDot className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">{location}</span>
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {shownSkills.map((skill, i) => (
                <span key={i} className="bg-amber-500/10 dark:bg-amber-400/15 text-slate-800 dark:text-amber-300 rounded-full px-2 py-0.5 text-[11px] font-medium border border-amber-500/20 dark:border-amber-400/25">
                  {formatSkillName(skill)}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  +{extraSkills}
                </span>
              )}
            </div>
          )}

          {showMatch && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className={`badge ${matchColor(match)}`}>{match}% Match</span>
                {match >= 70 && <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Great fit</span>}
              </div>
              <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, match))}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FaClock className="h-3 w-3" />
              {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}
            </span>
            <Link
              to={`/jobs/${job._id}`}
              className="text-sm font-semibold bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 px-4 py-2 rounded-lg transition-all inline-flex items-center gap-1.5 hover:opacity-90 shadow-xs"
            >
              View job
              <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </ParallaxCard>
  );
};

export default JobCard;
