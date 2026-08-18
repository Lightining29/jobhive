import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBolt,
  FaLocationDot,
  FaSackDollar,
  FaBriefcase,
  FaArrowRight,
  FaCircleCheck,
  FaStar,
  FaRegBuilding,
} from 'react-icons/fa6';
import { CompanyLogo } from '../jobs/JobCard';
import { formatSalary, timeAgo } from '../../utils/format';

const MarqueeJobItem = ({ job, neonColor = 'cyan' }) => {
  const salary = formatSalary(job.minSalary, job.maxSalary, job.currency);
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills.slice(0, 3) : [];

  const neonBorders = {
    cyan: 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    amber: 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]',
    emerald: 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    purple: 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]',
  };

  const borderClass = neonBorders[neonColor] || neonBorders.cyan;

  return (
    <div className={`w-[320px] sm:w-[360px] shrink-0 p-4 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/75 border ${borderClass} shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group hover:-translate-y-1`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo logo={job.companyLogo} name={job.companyName} size="md" />
          <div className="min-w-0">
            <Link
              to={`/jobs/${job._id}`}
              className="font-bold text-sm text-slate-900 dark:text-white truncate block group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors"
            >
              {job.jobTitle}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <FaRegBuilding className="h-3 w-3 shrink-0" />
              <span>{job.companyName}</span>
              {job.isVerified && <FaCircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />}
            </p>
          </div>
        </div>

        {job.workMode && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
            {job.workMode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
          <FaSackDollar className="h-3.5 w-3.5" />
          <span>{salary !== 'Not specified' ? salary : 'Competitive'}</span>
        </div>

        <span className="text-slate-400 dark:text-slate-500 text-[11px]">
          {job.postedDate ? timeAgo(job.postedDate) : 'Active now'}
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/25"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
          <FaLocationDot className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          {job.location || 'Remote'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-300 transition-all flex items-center gap-1 shadow-xs group-hover:scale-105"
        >
          View Role
          <FaArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );
};

export const AlternateJobsMarquee = ({
  row1Jobs = [],
  row2Jobs = [],
  title = 'Live Career Stream',
  subtitle = 'High-velocity job feeds scrolling across active tech sectors',
}) => {
  // Ensure enough items to create seamless looping by duplicating
  const track1 = row1Jobs.length > 0 ? [...row1Jobs, ...row1Jobs, ...row1Jobs, ...row1Jobs] : [];
  const track2 = row2Jobs.length > 0 ? [...row2Jobs, ...row2Jobs, ...row2Jobs, ...row2Jobs] : [];

  if (track1.length === 0 && track2.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-14 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent dark:via-[#080D1A]/80 transition-colors duration-300">
      {/* Background ambient neon glow spheres in dark mode */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 mb-3 shadow-xs">
          <FaBolt className="h-3 w-3 text-amber-500 animate-bounce" />
          <span>Real-Time Job Telemetry</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Row 1: Infinite Left Scroll */}
      <div className="relative w-full overflow-hidden mask-gradient-x mb-6">
        <div className="animate-marquee-left pause-on-hover flex gap-5 py-2">
          {track1.map((job, idx) => (
            <MarqueeJobItem
              key={`track1-${job._id || idx}-${idx}`}
              job={job}
              neonColor={idx % 2 === 0 ? 'cyan' : 'amber'}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Infinite Right Scroll (Alternate Direction) */}
      <div className="relative w-full overflow-hidden mask-gradient-x">
        <div className="animate-marquee-right pause-on-hover flex gap-5 py-2">
          {track2.map((job, idx) => (
            <MarqueeJobItem
              key={`track2-${job._id || idx}-${idx}`}
              job={job}
              neonColor={idx % 2 === 0 ? 'emerald' : 'purple'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlternateJobsMarquee;
