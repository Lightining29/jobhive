import React, { useState, useEffect } from 'react';
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
import { jobService } from '../../services';

const MarqueeJobItem = ({ job, neonColor = 'pink' }) => {
  const salary = formatSalary(job.minSalary, job.maxSalary, job.currency);
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills.slice(0, 3) : [];

  const neonCardClasses = {
    pink: 'dark:neon-playing-card-pink hover:scale-105',
    cyan: 'dark:neon-playing-card-cyan hover:scale-105',
    yellow: 'dark:neon-playing-card-yellow hover:scale-105',
    purple: 'dark:neon-playing-card-purple hover:scale-105',
  };

  const activeCardClass = neonCardClasses[neonColor] || neonCardClasses.cyan;

  return (
    <div className="w-[320px] sm:w-[360px] shrink-0 p-5 rounded-[24px] bg-white dark:!bg-[#040816] dark:neon-playing-card-cyan border border-slate-200 dark:border-[#00f0ff] shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden will-change-transform">
      {/* Playing Card Top Corner Neon Suit Mark */}
      <div className="absolute top-2.5 right-3 text-[10px] font-black text-cyan-400/50 select-none pointer-events-none">
        ✦
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-0.5 rounded-2xl dark:neon-avatar-ring-cyan shrink-0">
            <CompanyLogo logo={job.companyLogo} name={job.companyName} size="md" />
          </div>
          <div className="min-w-0">
            <Link
              to={`/jobs/${job._id}`}
              state={{ initialJob: job }}
              className="font-black text-sm text-slate-900 dark:text-white dark:neon-text-cyan truncate block group-hover:text-cyan-300 transition-all drop-shadow-sm"
            >
              {job.jobTitle}
            </Link>
            <p className="text-xs text-slate-500 dark:text-cyan-200/80 font-bold flex items-center gap-1 truncate mt-0.5">
              <FaRegBuilding className="h-3 w-3 shrink-0 text-cyan-400" />
              <span>{job.companyName}</span>
              {job.isVerified && <FaCircleCheck className="h-3 w-3 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_#10b981]" />}
            </p>
          </div>
        </div>

        {job.workMode && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 dark:neon-badge-yellow">
            {job.workMode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-cyan-500/30 text-xs">
        <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_8px_#00ff88]">
          <FaSackDollar className="h-3.5 w-3.5 text-emerald-400" />
          <span>{salary !== 'Not specified' ? salary : 'Competitive'}</span>
        </div>

        <span className="text-slate-400 dark:text-slate-300 text-[11px] font-semibold">
          {job.postedDate ? timeAgo(job.postedDate) : 'Active now'}
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.map((s, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                idx % 2 === 0
                  ? 'bg-amber-500/10 dark:neon-badge-yellow'
                  : 'bg-cyan-500/10 dark:neon-badge-cyan'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300 flex items-center gap-1 truncate">
          <FaLocationDot className="h-3 w-3 text-cyan-400" />
          {job.location || 'Remote'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          state={{ initialJob: job }}
          className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 hover:scale-105 transition-all flex items-center gap-1 shadow-md dark:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
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
  const [stream1, setStream1] = useState(row1Jobs);
  const [stream2, setStream2] = useState(row2Jobs);

  useEffect(() => {
    if (row1Jobs && row1Jobs.length > 0) setStream1(row1Jobs);
    if (row2Jobs && row2Jobs.length > 0) setStream2(row2Jobs);
  }, [row1Jobs, row2Jobs]);

  useEffect(() => {
    let isMounted = true;
    if (!stream1.length || !stream2.length) {
      Promise.all([
        jobService.getSection('latest', { limit: 8 }),
        jobService.getSection('trending', { limit: 8 }),
      ])
        .then(([res1, res2]) => {
          if (!isMounted) return;
          if (res1?.data?.jobs?.length) setStream1(res1.data.jobs);
          if (res2?.data?.jobs?.length) setStream2(res2.data.jobs);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure enough items to create seamless looping by duplicating
  const activeStream = stream1.length > 0 ? stream1 : row1Jobs;
  const track = activeStream.length > 0 ? [...activeStream, ...activeStream, ...activeStream, ...activeStream] : [];

  if (track.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-10 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent dark:from-[#030712] dark:via-[#030712] dark:to-[#030712] transition-colors duration-300">
      {/* Background ambient neon glow spheres in dark mode */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 mb-2 shadow-xs">
          <FaBolt className="h-3 w-3 text-amber-500 animate-bounce" />
          <span>Real-Time Opportunities</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Single Infinite Stream */}
      <div className="relative w-full overflow-hidden mask-gradient-x">
        <div className="animate-marquee-left pause-on-hover flex gap-5 py-2">
          {track.map((job, idx) => (
            <MarqueeJobItem
              key={`marquee-${job._id || idx}-${idx}`}
              job={job}
              neonColor={idx % 4 === 0 ? 'cyan' : idx % 4 === 1 ? 'pink' : idx % 4 === 2 ? 'yellow' : 'purple'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlternateJobsMarquee;
