/**
 * JobResultCard — compact job card shown in voice assistant results.
 * Links to the full job detail page.
 */
import { Link } from 'react-router-dom';
import { FaLocationDot, FaBriefcase, FaIndianRupeeSign } from 'react-icons/fa6';
import { motion } from 'framer-motion';

function workModeBadge(mode) {
  const map = {
    remote: 'badge-emerald',
    hybrid: 'badge-primary',
    onsite: 'badge-muted',
  };
  return map[mode] || 'badge-muted';
}

export default function JobResultCard({ job, index = 0 }) {
  if (!job) return null;

  const salary =
    job.salaryMax > 0
      ? `${(job.salaryMax / 100000).toFixed(1)} LPA`
      : job.salaryMin > 0
      ? `${(job.salaryMin / 100000).toFixed(1)}+ LPA`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Link
        to={`/jobs/${job._id}`}
        state={{ initialJob: job }}
        className="block p-3 rounded-xl border border-line bg-white hover:border-primary-300 hover:shadow-soft transition-all group"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex items-start gap-2.5">
          {/* Company logo */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="h-8 w-8 rounded-lg object-contain border border-line flex-shrink-0 bg-white"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span
            className={`h-8 w-8 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0 items-center justify-center text-xs font-bold text-primary-700 ${job.companyLogo ? 'hidden' : 'flex'}`}
          >
            {(job.companyName || 'C').slice(0, 2).toUpperCase()}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink line-clamp-1 group-hover:text-primary-600 transition-colors">
              {job.jobTitle}
            </p>
            <p className="text-xs text-muted truncate">{job.companyName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {job.workMode && (
            <span className={`badge ${workModeBadge(job.workMode)} !text-[10px] !px-2 !py-0.5`}>
              {job.workMode}
            </span>
          )}
          {job.employmentType && (
            <span className="badge badge-muted !text-[10px] !px-2 !py-0.5">
              {job.employmentType}
            </span>
          )}
          {(job.city || job.country) && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted">
              <FaLocationDot className="h-2.5 w-2.5" />
              {job.city || job.country}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium">
              <FaIndianRupeeSign className="h-2.5 w-2.5" />
              {salary}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
