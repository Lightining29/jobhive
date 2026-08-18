import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaMagnifyingGlass, FaArrowTrendUp, FaRotate, FaSliders, FaXmark } from 'react-icons/fa6';
import { jobService } from '../services';
import JobCard from '../components/jobs/JobCard';
import SidebarFilters from '../components/jobs/SidebarFilters';
import SemanticSearchBar from '../components/jobs/SemanticSearchBar';
import Pagination from '../components/ui/Pagination';
import { useDebounce } from '../hooks';
import { LoadingJobs, EmptyState } from '../components/ui/States';
import { capitalize } from '../utils/format';
import SEOHead from '../components/seo/SEOHead';

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
  const navigate = useNavigate();

  const preset       = PRESET_PATHS[location.pathname] || {};
  const searchQuery  = params.get('search') || '';
  const presetCategory  = preset.category  || params.get('category')  || '';
  const presetWorkMode  = preset.workMode  || params.get('workMode')  || '';
  const presetExperience = params.get('experience') || '';
  const initialPage  = Math.max(parseInt(params.get('page') || '1', 10), 1);

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(initialPage);
  const [sort,    setSort]    = useState('newest');
  const [semanticActive, setSemanticActive] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [counts,  setCounts]  = useState({ technical: 0, 'non-technical': 0, remote: 0, hybrid: 0, onsite: 0 });

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

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.category) c++;
    if (filters.workModes?.length) c += filters.workModes.length;
    if (filters.employmentTypes?.length) c += filters.employmentTypes.length;
    if (filters.experienceLevel) c++;
    if (filters.salaryMin) c++;
    if (filters.source) c++;
    if (filters.postedWithinDays) c++;
    return c;
  }, [filters]);

  // Sync state if pathname or search params change externally (e.g. clicking top nav links)
  useEffect(() => {
    const nextCategory = preset.category || params.get('category') || '';
    const nextWorkMode = preset.workMode || params.get('workMode') || '';
    const nextSearch = params.get('search') || '';
    const nextExp = params.get('experience') || '';

    setFilters((prev) => {
      if (
        prev.category === nextCategory &&
        prev.search === nextSearch &&
        prev.experienceLevel === nextExp &&
        (prev.workModes?.[0] || '') === nextWorkMode
      ) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategory,
        workModes: nextWorkMode ? [nextWorkMode] : prev.workModes,
        search: nextSearch,
        experienceLevel: nextExp,
      };
    });
  }, [location.pathname]);

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
      if (data?.counts) {
        setCounts(data.counts);
      }
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
    filtersRef.current = next;

    const sp = new URLSearchParams();
    if (next.search)          sp.set('search',   next.search);
    if (next.category)        sp.set('category', next.category);
    if (next.workModes?.[0])  sp.set('workMode', next.workModes[0]);
    if (next.experienceLevel) sp.set('experience', next.experienceLevel);
    sp.set('page', '1');

    if (PRESET_PATHS[location.pathname]) {
      navigate(`/jobs?${sp.toString()}`, { replace: true });
    } else {
      setParams(sp, { replace: true });
    }
    fetchJobs(1);
  };

  const clearFilters = () => {
    const empty = { search:'', category:'', workModes:[], employmentTypes:[], experienceLevel:'', salaryMin:'', source:'', postedWithinDays:'' };
    setFilters(empty);
    filtersRef.current = empty;
    if (PRESET_PATHS[location.pathname]) {
      navigate('/jobs', { replace: true });
    } else {
      setParams({}, { replace: true });
    }
    fetchJobs(1);
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

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing and fetching latest career jobs...');
    try {
      const { data } = await jobService.refresh();
      toast.success(data?.message || 'Jobs refreshed successfully!', { id: toastId });
      fetchJobs(1);
    } catch (err) {
      toast.error(err.message || 'Failed to refresh jobs', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  // Dynamic SEO attributes based on active filter or search query
  const seoQuery = filters.search || presetCategory || presetWorkMode || 'Browse Jobs';
  const seoTitle = filters.search
    ? `${filters.search} Jobs - Openings & Vacancies`
    : presetCategory
    ? `${capitalize(presetCategory)} Jobs - Tech & Career Roles`
    : presetWorkMode
    ? `${capitalize(presetWorkMode)} Jobs - Work Opportunities`
    : 'Browse All Jobs - Tech, Remote & Verified Careers';
  
  const seoDescription = `Search ${total || '10,000+'} verified ${filters.search || presetCategory || presetWorkMode || ''} job openings on Job Workplace. Find high-paying tech, software engineering, and remote positions.`;
  const seoKeywords = [
    filters.search,
    `${filters.search} jobs`,
    `${filters.search} developer`,
    presetCategory ? `${presetCategory} jobs` : null,
    presetWorkMode ? `${presetWorkMode} jobs` : null,
    'java jobs', 'remote jobs', 'software jobs', 'hiring now', 'careers'
  ].filter(Boolean);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://jobworkplace.com/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Jobs',
        'item': 'https://jobworkplace.com/jobs',
      },
      ...(filters.search ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': `${filters.search} Jobs`,
        'item': `https://jobworkplace.com/jobs?search=${encodeURIComponent(filters.search)}`,
      }] : []),
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        schema={breadcrumbSchema}
      />
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">{heading}</h1>
          {!semanticActive && (
            <p className="text-muted mt-1">
              {loading ? 'Searching...' : <><span className="font-semibold text-ink">{total.toLocaleString()}</span> jobs found</>}
            </p>
          )}
        </div>
        <button
          onClick={handleRefreshJobs}
          disabled={refreshing}
          className="btn-outline !py-2.5 !px-4 text-xs font-semibold gap-2 border-line hover:border-primary-500 hover:text-primary-600 transition-all rounded-xl shadow-sm"
          title="Fetch latest job postings from company career pages and job boards"
        >
          <FaRotate className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : 'text-muted'}`} />
          {refreshing ? 'Refreshing Jobs...' : 'Refresh Latest Jobs'}
        </button>
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
                counts={counts}
              />
            </div>

            {/* Jobs column */}
            <div className="lg:col-span-3">

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2">
                  {/* Mobile Filters Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-line hover:border-primary-500 rounded-xl text-sm font-semibold text-ink shadow-sm transition-all"
                  >
                    <FaSliders className="h-4 w-4 text-primary" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-primary text-ink text-xs font-bold px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

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
                    {(filters.category || filters.workModes?.length > 0 || activeFilterCount > 0) && (
                      <button onClick={clearFilters} className="text-xs text-muted hover:text-red-500">
                        Clear all
                      </button>
                    )}
                  </div>
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

          {/* ── Mobile Filters Slide-over Drawer ─────────────────────── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden overflow-hidden" role="dialog" aria-modal="true">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setMobileFiltersOpen(false)}
              />

              {/* Drawer Panel */}
              <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slide-left">
                  {/* Drawer Header */}
                  <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <FaSliders className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-bold text-ink">Filters</h3>
                      {activeFilterCount > 0 && (
                        <span className="bg-primary/20 text-yellow-900 font-bold text-xs px-2 py-0.5 rounded-full">
                          {activeFilterCount} active
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-slate-200 transition-all"
                      aria-label="Close filters"
                    >
                      <FaXmark className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Scrollable Filters Body */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <SidebarFilters
                      filters={filters}
                      onChange={handleFilterChange}
                      onClear={clearFilters}
                      counts={counts}
                      className="!p-0 !border-0 !shadow-none !bg-transparent"
                      hideHeader={true}
                    />
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="p-4 border-t border-line bg-slate-50 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                      }}
                      className="btn-outline flex-1 !py-2.5 text-sm font-semibold"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="btn-primary flex-1 !py-2.5 text-sm font-semibold shadow-md"
                    >
                      {loading ? 'Searching...' : `Show ${total.toLocaleString()} Jobs`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobsPage;
