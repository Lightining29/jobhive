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

const MarqueeJobItem = ({ job, neonColor = 'pink' }) => {
  const salary = formatSalary(job.minSalary, job.maxSalary, job.currency);
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills.slice(0, 3) : [];

  const neonCardClasses = {
    pink: 'dark:neon-acrylic-pink hover:scale-105',
    cyan: 'dark:neon-acrylic-cyan hover:scale-105',
    yellow: 'dark:neon-acrylic-yellow hover:scale-105',
    purple: 'dark:neon-acrylic-purple hover:scale-105',
  };

  const activeCardClass = neonCardClasses[neonColor] || neonCardClasses.pink;

  return (
    <div className={`w-[320px] sm:w-[360px] shrink-0 p-5 rounded-[26px] bg-white/90 dark:bg-[#080C1B]/85 ${activeCardClass} border border-slate-200 dark:border-pink-500/40 shadow-xl transition-all duration-300 group hover:-translate-y-1`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-0.5 rounded-full dark:neon-avatar-ring-pink">
            <CompanyLogo logo={job.companyLogo} name={job.companyName} size="md" />
          </div>
          <div className="min-w-0">
            <Link
              to={`/jobs/${job._id}`}
              className="font-black text-sm text-slate-900 dark:text-white truncate block group-hover:neon-text-pink transition-all drop-shadow-sm"
            >
              {job.jobTitle}
            </Link>
            <p className="text-xs text-slate-500 dark:text-pink-300 font-semibold flex items-center gap-1 truncate mt-0.5">
              <FaRegBuilding className="h-3 w-3 shrink-0" />
              <span>{job.companyName}</span>
              {job.isVerified && <FaCircleCheck className="h-3 w-3 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_#10b981]" />}
            </p>
          </div>
        </div>

        {job.workMode && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/10 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-500/30 dark:border-pink-500/60 shadow-[0_0_10px_rgba(255,45,135,0.25)]">
            {job.workMode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-pink-500/30 text-xs">
        <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_8px_#00ff88]">
          <FaSackDollar className="h-3.5 w-3.5" />
          <span>{salary !== 'Not specified' ? salary : 'Competitive'}</span>
        </div>

        <span className="text-slate-400 dark:text-slate-300 text-[11px] font-medium">
          {job.postedDate ? timeAgo(job.postedDate) : 'Active now'}
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/40 shadow-2xs"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-300 flex items-center gap-1 truncate">
          <FaLocationDot className="h-3 w-3 text-pink-400" />
          {job.location || 'Remote'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-gradient-to-r dark:from-pink-500 dark:to-rose-600 hover:scale-105 transition-all flex items-center gap-1 shadow-md dark:shadow-[0_0_15px_rgba(255,45,135,0.5)]"
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
    <section className="relative overflow-hidden py-14 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent dark:from-[#030712] dark:via-[#030712] dark:to-[#030712] transition-colors duration-300">
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
              neonColor={idx % 4 === 0 ? 'pink' : idx % 4 === 1 ? 'cyan' : idx % 4 === 2 ? 'yellow' : 'purple'}
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
              neonColor={idx % 4 === 0 ? 'cyan' : idx % 4 === 1 ? 'pink' : idx % 4 === 2 ? 'purple' : 'yellow'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlternateJobsMarquee;
