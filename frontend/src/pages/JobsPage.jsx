import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaMagnifyingGlass, FaArrowTrendUp } from 'react-icons/fa6';
import { jobService } from '../services';
import JobCard from '../components/jobs/JobCard';
import SidebarFilters from '../components/jobs/SidebarFilters';
import SemanticSearchBar from '../components/jobs/SemanticSearchBar';
import Pagination from '../components/ui/Pagination';
import { useDebounce } from '../hooks';
import { LoadingJobs, EmptyState } from '../components/ui/States';
import { capitalize } from '../utils/format';

const SORTS = [
  { value: 'newest',   label: 'Newest first'    },
  { value: 'salary',   label: 'Highest salary'  },
  { value: 'trending', label: 'Trending'         },
  { value: 'oldest',   label: 'Oldest first'    },
];

const PAGE_SIZE = 12;

const PRESET_PATHS = {
  '/jobs/technical':     { category: 'technical' },
  '/jobs/non-technical': { category: 'non-technical' },
  '/jobs/remote':        { workMode: 'remote' },
  '/jobs/hybrid':        { workMode: 'hybrid' },
  '/jobs/onsite':        { workMode: 'onsite' },
};

const JobsPage = () => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();

  const preset       = PRESET_PATHS[location.pathname] || {};
  const searchQuery  = params.get('search') || '';
  const presetCategory  = preset.category  || params.get('category')  || '';
  const presetWorkMode  = preset.workMode  || params.get('workMode')  || '';
  const presetExperience = params.get('experience') || '';
  const initialPage  = Math.max(parseInt(params.get('page') || '1', 10), 1);

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(initialPage);
  const [sort,    setSort]    = useState('newest');
  const [semanticActive, setSemanticActive] = useState(false);

  const [filters, setFilters] = useState({
    search:         searchQuery,
    category:       presetCategory,
    workModes:      presetWorkMode ? [presetWorkMode] : [],
    employmentTypes:[],
    experienceLevel:presetExperience,
    salaryMin:      '',
    source:         '',
    postedWithinDays:'',
  });

  const debouncedSearch = useDebounce(filters.search, 450);

  // Use refs for values that the fetch function needs but shouldn't
  // be in its dependency array — prevents the effect from re-firing on page changes
  const filtersRef = useRef(filters);
  const sortRef    = useRef(sort);
  filtersRef.current = filters;
  sortRef.current    = sort;

  // Core fetch — reads from refs so it's stable and never goes stale
  const fetchJobs = useCallback(async (pageNum) => {
    const f   = filtersRef.current;
    const srt = sortRef.current;

    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const q = { page: pageNum, limit: PAGE_SIZE, sort: srt };
    if (debouncedSearch)              q.search          = debouncedSearch;
    if (f.category)                   q.category         = f.category;
    if (f.workModes?.length)          q.workMode         = f.workModes[0];
    if (f.employmentTypes?.length)    q.employmentType   = f.employmentTypes[0];
    if (f.experienceLevel)            q.experience       = f.experienceLevel;
    if (f.salaryMin)                  q.salaryMin        = f.salaryMin;
    if (f.source)                     q.source           = f.source;
    if (f.postedWithinDays)           q.postedWithinDays = f.postedWithinDays;

    try {
      const { data } = await jobService.list(q);
      const jobsList = Array.isArray(data?.jobs) ? data.jobs : [];
      const pageInfo = data?.pagination || {};
      setJobs(jobsList);
      setTotal(pageInfo.total || 0);
      setPages(pageInfo.pages || 1);
      setPage(pageInfo.page || 1);
      setParams((prev) => {
        const sp = new URLSearchParams(prev);
        if (pageInfo.page) {
          sp.set('page', String(pageInfo.page));
        }
        return sp;
      }, { replace: true });
    } catch (err) {
      setJobs([]);
      setTotal(0);
      setPages(1);
      toast.error(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // only debouncedSearch here — filters/sort read from refs

  // Reset to page 1 whenever filters, sort, or search change
  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [fetchJobs, sort]); // fetchJobs changes on debouncedSearch change; sort is explicit

  // Page change — called by Pagination component, does NOT reset to page 1
  const handlePageChange = useCallback((newPage) => {
    fetchJobs(newPage);
  }, [fetchJobs]);

  const handleFilterChange = (next) => {
    setFilters(next);
    // Use setTimeout so filtersRef.current is updated before fetchJobs reads it
    setTimeout(() => fetchJobs(1), 0);
    const sp = new URLSearchParams();
    if (next.search)          sp.set('search',   next.search);
    if (next.category)        sp.set('category', next.category);
    if (next.workModes?.[0])  sp.set('workMode', next.workModes[0]);
    if (next.experienceLevel) sp.set('experience', next.experienceLevel);
    sp.set('page', '1');
    setParams(sp, { replace: true });
  };

  const clearFilters = () => {
    const empty = { search:'', category:'', workModes:[], employmentTypes:[], experienceLevel:'', salaryMin:'', source:'', postedWithinDays:'' };
    setFilters(empty);
    setTimeout(() => fetchJobs(1), 0);
    setParams({}, { replace: true });
  };

  const onSearchSubmit = (e) => { e.preventDefault(); fetchJobs(1); };

  const heading = useMemo(() => {
    if (filters.category === 'technical')     return 'Technical Jobs';
    if (filters.category === 'non-technical') return 'Non-Technical Jobs';
    if (filters.workModes?.[0] === 'remote')  return 'Remote Jobs';
    if (filters.workModes?.[0] === 'hybrid')  return 'Hybrid Jobs';
    if (filters.workModes?.[0] === 'onsite')  return 'On-site Jobs';
    return debouncedSearch ? `Results for "${debouncedSearch}"` : 'Browse Jobs';
  }, [filters, debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">{heading}</h1>
        {!semanticActive && (
          <p className="text-muted mt-1">
            {loading ? 'Searching...' : <><span className="font-semibold text-ink">{total.toLocaleString()}</span> jobs found</>}
          </p>
        )}
      </div>

      {/* ── AI Semantic Search ────────────────────────────────────────────── */}
      <SemanticSearchBar onResultsChange={(jobs) => setSemanticActive(jobs !== null)} />

      {!semanticActive && (
        <>
          {/* ── Keyword search bar ──────────────────────────────────────── */}
          <form onSubmit={onSearchSubmit} className="mb-6">
            <div className="relative max-w-2xl">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                placeholder="Search by job title, company, or skill..."
                className="input !py-3.5 !pl-12 !rounded-2xl shadow-soft"
              />
            </div>
          </form>

          {/* ── Main grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Sidebar */}
            <div className="hidden lg:block">
              <SidebarFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
                counts={{ technical: 0, 'non-technical': 0 }}
              />
            </div>

            {/* Jobs column */}
            <div className="lg:col-span-3">

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {filters.category && (
                    <span className="badge bg-primary-50 text-yellow-800 border border-accent">
                      {capitalize(filters.category)}
                    </span>
                  )}
                  {filters.workModes?.map((w) => (
                    <span key={w} className="badge bg-primary-50 text-yellow-800 border border-accent">
                      {capitalize(w)}
                    </span>
                  ))}
                  {(filters.category || filters.workModes?.length > 0) && (
                    <button onClick={clearFilters} className="text-xs text-muted hover:text-red-500">
                      Clear filters
                    </button>
                  )}
                </div>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); }}
                  className="input !w-auto !py-2 text-sm shrink-0"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Job cards */}
              {loading ? (
                <LoadingJobs count={PAGE_SIZE} />
              ) : !Array.isArray(jobs) || jobs?.length < 1 ? (
                <div className="card">
                  <EmptyState
                    icon={FaMagnifyingGlass}
                    title="No jobs found"
                    description="Try adjusting your filters or search terms."
                    action={<button onClick={clearFilters} className="btn-primary">Clear filters</button>}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              )}

              {/* ── Pagination ─────────────────────────────────────────── */}
              {!loading && Array.isArray(jobs) && jobs?.length > 0 && (
                <Pagination
                  page={page}
                  pages={pages}
                  total={total}
                  limit={PAGE_SIZE}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </div>
          </div>

          {/* Mobile filters */}
          <div className="lg:hidden mt-6">
            <details className="card p-4">
              <summary className="font-semibold cursor-pointer flex items-center gap-2 text-sm">
                <FaArrowTrendUp className="h-4 w-4 text-primary" /> Show Filters
              </summary>
              <div className="mt-4">
                <SidebarFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={clearFilters}
                  counts={{}}
                />
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  );
};

export default JobsPage;
