import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaRotate, FaPlus, FaBriefcase, FaLocationDot } from 'react-icons/fa6';
import { jobService } from '../../services';
import JobCard, { CompanyLogo } from '../jobs/JobCard';
import { LoadingJobs } from '../ui/States';

export const SectionHeader = ({ title, subtitle, to }) => {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <span className="block h-1 w-12 rounded-full mb-3 bg-amber-400 dark:bg-amber-400" />
        <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm mt-1.5 text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-amber-400 hover:text-primary-700 dark:hover:text-amber-300 transition-all shrink-0">
          View all
          <FaArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};

export const LazyJobSection = ({
  sectionName,
  title,
  subtitle,
  to,
  cols = 4,
  initialJobs = null,
  initialVisible = false,
  limit = 8,
  emptyText = 'No jobs available in this section right now.',
}) => {
  const [jobs, setJobs] = useState(initialJobs || []);
  const [loading, setLoading] = useState(!initialJobs);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasFetched, setHasFetched] = useState(Boolean(initialJobs && initialJobs.length > 0));
  const containerRef = useRef(null);

  const fetchSectionJobs = useCallback(async (pageNum, isAppend = false) => {
    if (isAppend) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await jobService.getSection(sectionName, { page: pageNum, limit });
      const newJobs = res?.data?.jobs || [];
      const pagination = res?.data?.pagination || {};

      if (isAppend) {
        setJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j._id));
          const filtered = newJobs.filter((j) => !existingIds.has(j._id));
          return [...prev, ...filtered];
        });
      } else {
        setJobs(newJobs);
      }

      setPage(pageNum);
      setHasMore(Boolean(pagination.hasMore));
      setHasFetched(true);
    } catch {
      if (!isAppend) setJobs([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sectionName, limit]);

  useEffect(() => {
    if (initialJobs && initialJobs.length > 0) {
      setJobs(initialJobs);
      setLoading(false);
      setHasFetched(true);
    }
  }, [initialJobs]);

  useEffect(() => {
    if (initialVisible && !hasFetched) {
      fetchSectionJobs(1, false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasFetched) {
          fetchSectionJobs(1, false);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px 0px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasFetched, fetchSectionJobs, initialVisible]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchSectionJobs(page + 1, true);
  };

  const gridCols = cols === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section ref={containerRef} className="scroll-mt-20">
      <SectionHeader title={title} subtitle={subtitle} to={to} />

      {loading && !jobs.length ? (
        <LoadingJobs count={cols} />
      ) : jobs.length === 0 && hasFetched ? (
        <div className="card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          <FaBriefcase className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <>
          <div className={`grid ${gridCols} gap-4`}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} match={job.match?.score} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-400 hover:text-amber-500 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <FaRotate className="h-3.5 w-3.5 animate-spin text-amber-500" />
                    <span>Loading more {title.toLowerCase()}...</span>
                  </>
                ) : (
                  <>
                    <FaPlus className="h-3 w-3 text-amber-500" />
                    <span>Load more {title.toLowerCase()}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export const LazyCompaniesSection = ({ initialItems = null }) => {
  const [companies, setCompanies] = useState(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [hasFetched, setHasFetched] = useState(Boolean(initialItems && initialItems.length > 0));
  const containerRef = useRef(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.getSection('companies', { limit: 10 });
      setCompanies(res?.data?.items || []);
      setHasFetched(true);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setCompanies(initialItems);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasFetched) {
          fetchCompanies();
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasFetched, fetchCompanies, initialItems]);

  return (
    <section ref={containerRef} className="scroll-mt-20">
      <SectionHeader title="Featured Companies" subtitle="Companies hiring on JobHive" />
      {loading && !companies.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {companies.map((c) => (
            <div key={c._id} className="card card-hover p-5 flex flex-col items-center text-center group hover:border-primary-300 dark:hover:border-primary-500/40">
              <CompanyLogo logo={c.logo?.url} name={c.name} />
              <p className="font-semibold text-sm mt-3 truncate w-full text-slate-900 dark:text-white transition-colors">{c.name}</p>
              {c.industry && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.industry}</p>}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export const LazyLocationsSection = ({ initialItems = null }) => {
  const [locations, setLocations] = useState(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [hasFetched, setHasFetched] = useState(Boolean(initialItems && initialItems.length > 0));
  const containerRef = useRef(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.getSection('locations', { limit: 12 });
      setLocations(res?.data?.items || []);
      setHasFetched(true);
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setLocations(initialItems);
      setLoading(false);
      setHasFetched(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasFetched) {
          fetchLocations();
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasFetched, fetchLocations, initialItems]);

  return (
    <section ref={containerRef} className="scroll-mt-20">
      <SectionHeader title="Jobs Near Me" subtitle="Popular job locations" />
      {loading && !locations.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {locations.map((l) => (
            <Link
              key={l.city}
              to={`/jobs?city=${encodeURIComponent(l.city)}`}
              className="card card-hover p-4 text-center group hover:border-primary-300 dark:hover:border-primary-500/40"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FaLocationDot className="h-5 w-5 text-primary-600 dark:text-amber-400" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white transition-colors">{l.city}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.count} jobs</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
};
