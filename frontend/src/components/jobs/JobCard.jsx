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

  // If a valid uploaded custom logo exists and hasn't failed, show image
  const hasCustomLogo = logo && typeof logo === 'string' && logo.trim().length > 4 && !imgError;

  if (hasCustomLogo) {
    return (
      <img
        src={logo}
        alt={name ? `${name} company logo` : 'Company Logo'}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizes[size]} object-contain p-1 bg-white dark:bg-[#070e24] border border-slate-200 dark:border-2 dark:border-[#00f0ff] dark:shadow-[0_0_12px_rgba(0,240,255,0.6)] shadow-sm ${className}`}
      />
    );
  }

  // Pure glowing text initials badge (as before - no broken image icon)
  return (
    <div className={`${sizes[size]} flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-slate-200 dark:bg-[#070e24] dark:border-2 dark:border-[#00f0ff] dark:shadow-[0_0_14px_rgba(0,240,255,0.6)] ${className}`}>
      {name ? (
        <span className={`${textSizes[size]} font-black text-slate-900 dark:text-[#00f0ff] dark:neon-text-cyan leading-none`}>{initials(name)}</span>
      ) : (
        <FaBuilding className={size === 'lg' ? 'h-6 w-6 text-slate-700 dark:text-[#00f0ff]' : 'h-4 w-4 text-slate-700 dark:text-[#00f0ff]'} />
      )}
    </div>
  );
};



const WORK_MODE_BADGES = {
  remote: { label: 'Remote', icon: FaGlobe, cls: 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50' },
  hybrid: { label: 'Hybrid', icon: FaBuilding, cls: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/50' },
  onsite: { label: 'On-site', icon: FaLocationDot, cls: 'bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-500/50' },
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
    <ParallaxCard maxRotation={3} scale={1.01} className="h-full">
      <div className="card card-hover p-5 flex flex-col h-full bg-white dark:!bg-[#040816] dark:neon-playing-card-cyan dark:hover:border-sky-300 dark:hover:shadow-[0_0_35px_rgba(0,240,255,0.85)] transition-all duration-300 rounded-[24px] relative overflow-hidden">
        {/* Playing card corner accent mark */}
        <div className="absolute top-2.5 right-3 text-[10px] font-black text-cyan-400/50 select-none pointer-events-none">
          ❖
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-0.5 rounded-2xl dark:neon-avatar-ring-cyan shrink-0">
              <CompanyLogo logo={job.companyLogo} name={job.companyName} />
            </div>
            <div className="min-w-0">
              <Link
                to={`/jobs/${job._id}`}
                state={{ initialJob: job }}
                className="block font-black text-slate-900 dark:text-white dark:neon-text-cyan leading-snug hover:text-primary-600 dark:hover:text-cyan-200 transition-all"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {job.jobTitle}
              </Link>
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:neon-badge-yellow px-2 py-0.5 rounded-md mt-1 line-clamp-1 max-w-full">
                {job.headline && job.headline.trim() ? job.headline : `${job.jobTitle}${job.companyName ? ` at ${job.companyName}` : ''}`}
              </p>
              <p className="text-sm text-slate-500 dark:text-cyan-200/80 flex items-center gap-1 mt-1 min-w-0 font-medium">
                <FaRegBuilding className="h-3 w-3 shrink-0 text-cyan-400" />
                <span className="truncate">{job.companyName}</span>
                {job.isVerified && (
                  <FaCircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400 drop-shadow-[0_0_8px_#10b981]" title="Verified employer" />
                )}
              </p>
            </div>
          </div>
          {showSave && (
            <button
              onClick={() => toggleSaved(job._id)}
              className={`shrink-0 p-2 rounded-lg transition-colors ${isSaved ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-cyan-500/10'}`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              {isSaved ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {workMode && (() => {
            const ModeIcon = WORK_MODE_BADGES[workMode].icon;
            return (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${WORK_MODE_BADGES[workMode].cls}`}>
                <ModeIcon className="h-3 w-3" />
                {WORK_MODE_BADGES[workMode].label}
              </span>
            );
          })()}
          {employment && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-slate-100 text-slate-900 border-slate-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-500/40">
              <FaBriefcase className="h-3 w-3" />
              {employment}
            </span>
          )}
          {job.experienceLevel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-indigo-50 text-indigo-950 border-indigo-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-500/40">
              {capitalize(job.experienceLevel)}
            </span>
          )}
          {sourceLabel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-slate-50 text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700">
              <span className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT_COLORS[job.source] || 'bg-cyan-400'}`} />
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
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-cyan-500/20 space-y-2">
              {desc.summary && (
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-200 line-clamp-2">
                  {desc.summary}
                </p>
              )}
              {desc.responsibilities && (
                <div className="flex items-start gap-1.5">
                  <FaSuitcase className="h-3 w-3 text-primary-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] leading-snug text-slate-500 dark:text-slate-300 line-clamp-1">
                    {desc.responsibilities}
                  </p>
                </div>
              )}
              {desc.requirements && (
                <div className="flex items-start gap-1.5">
                  <FaStar className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] leading-snug text-slate-500 dark:text-slate-300 line-clamp-1">
                    {desc.requirements}
                  </p>
                </div>
              )}
              {desc.skills && (
                <p className="text-[11px] text-slate-800 dark:text-cyan-200 font-medium">
                  {desc.skills}
                </p>
              )}
            </div>
          );
        })()}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-1.5">
            {hasSalary && <FaSackDollar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 drop-shadow-[0_0_8px_#10b981]" />}
            <span className={`text-base font-black ${hasSalary ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`}>{salary}</span>
            {hasSalary && <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">/ year</span>}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-300 flex items-center gap-1.5 mt-2 min-w-0 font-medium">
            <FaLocationDot className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span className="truncate">{location}</span>
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {shownSkills.map((skill, i) => (
                <span key={i} className="bg-amber-500/10 dark:neon-badge-yellow text-slate-800 dark:text-amber-300 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  {formatSkillName(skill)}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="bg-slate-100 dark:neon-badge-cyan text-slate-500 dark:text-cyan-300 rounded-full px-2 py-0.5 text-[11px] font-bold">
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

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-cyan-500/30 pt-3 mt-4">
            <span className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1 font-medium">
              <FaClock className="h-3 w-3 text-cyan-400" />
              {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}
            </span>
            <Link
              to={`/jobs/${job._id}`}
              state={{ initialJob: job }}
              className="text-sm font-black bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 hover:scale-105 shadow-md dark:shadow-[0_0_15px_rgba(250,204,21,0.6)]"
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
