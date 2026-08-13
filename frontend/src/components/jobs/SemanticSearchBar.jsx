/**
 * SemanticSearchBar — natural language job search.
 * Understands intent, not just keywords.
 * Renders above the regular search bar on JobsPage.
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWandMagicSparkles, FaArrowRight, FaXmark, FaCircleInfo } from 'react-icons/fa6';
import { jobService } from '../../services';
import JobCard from './JobCard';

const EXAMPLES = [
  'Remote backend jobs using Java and Docker',
  'Senior React developer in Bangalore paying 20 LPA',
  'Internships for freshers in Delhi',
  'Data science jobs highest salary',
  'Full-stack engineer with Node and MongoDB hybrid',
  'DevOps roles with Kubernetes and AWS',
];

const PARAM_LABELS = {
  workMode:       { label: 'Mode',       color: 'badge-emerald' },
  employmentType: { label: 'Type',       color: 'badge-primary' },
  experience:     { label: 'Level',      color: 'badge-muted' },
  city:           { label: 'City',       color: 'badge-accent' },
  country:        { label: 'Country',    color: 'badge-accent' },
  skills:         { label: 'Skills',     color: 'badge-primary' },
  category:       { label: 'Category',   color: 'badge-muted' },
  search:         { label: 'Title',      color: 'badge-muted' },
  salaryMin:      { label: 'Min Salary', color: 'badge-emerald' },
  sort:           { label: 'Sort',       color: 'badge-muted' },
};

export default function SemanticSearchBar({ onResultsChange }) {
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null); // null = not searched yet
  const [parsed, setParsed]       = useState(null);
  const [total, setTotal]         = useState(0);
  const [error, setError]         = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef(null);

  const search = useCallback(async (q = query) => {
    const text = (q || '').trim();
    if (!text || text.length < 3) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setParsed(null);

    try {
      const { data } = await jobService.semanticSearch(text);
      const jobsList = Array.isArray(data?.jobs) ? data.jobs : [];
      setResults(jobsList);
      setParsed(data?.parsed || {});
      setTotal(data?.pagination?.total || 0);
      onResultsChange?.(jobsList, data?.pagination?.total || 0);
    } catch (err) {
      setResults([]);
      setError(err.response?.data?.message || err.message || 'Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [query, onResultsChange]);

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); search(); }
  };

  const clear = () => {
    setQuery('');
    setResults(null);
    setParsed(null);
    setError(null);
    setTotal(0);
    onResultsChange?.(null, 0);
    inputRef.current?.focus();
  };

  const formatSalary = (v) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)} LPA` : `₹${v.toLocaleString()}`;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FaWandMagicSparkles className="h-4 w-4 text-primary-600" />
        <span className="text-sm font-semibold text-ink">Semantic Search</span>
        <span className="badge badge-primary !text-[10px]">AI</span>
        <button
          onClick={() => setShowExamples(s => !s)}
          className="ml-auto text-xs text-muted hover:text-primary-600 flex items-center gap-1"
        >
          <FaCircleInfo className="h-3 w-3" />
          {showExamples ? 'Hide examples' : 'See examples'}
        </button>
      </div>

      {/* Examples */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); setShowExamples(false); search(ex); }}
                  className="text-xs bg-white border border-primary-200 text-primary-700 rounded-full px-3 py-1.5 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="relative">
        <FaWandMagicSparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe what you're looking for... e.g. Remote Java jobs with Docker in Bangalore"
          className="input !pl-11 !pr-28 !py-3.5 !rounded-2xl shadow-soft text-sm"
          maxLength={300}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button onClick={clear} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
              <FaXmark className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => search()}
            disabled={loading || query.trim().length < 3}
            className="btn-primary !py-2 !px-3.5 !text-xs disabled:opacity-40"
          >
            {loading
              ? <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FaArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}

      {/* Parsed intent chips */}
      <AnimatePresence>
        {parsed && Object.keys(parsed).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap items-center gap-2 mt-3"
          >
            <span className="text-[11px] text-muted font-medium">Understood:</span>
            {Object.entries(parsed).map(([key, val]) => {
              if (!val) return null;
              const meta  = PARAM_LABELS[key] || { label: key, color: 'badge-muted' };
              const display = key === 'salaryMin' ? formatSalary(val)
                            : key === 'skills'    ? val.split(',').slice(0, 3).join(', ')
                            : String(val);
              return (
                <span key={key} className={`badge ${meta.color} !text-[11px] gap-1`}>
                  <span className="opacity-60">{meta.label}:</span> {display}
                </span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">
                {total > 0
                  ? <><span className="text-primary-600">{total.toLocaleString()}</span> jobs matched your description</>
                  : 'No jobs matched — try rephrasing your search'}
              </p>
              {Array.isArray(results) && results.length > 0 && (
                <button onClick={clear} className="text-xs text-muted hover:text-red-500 transition-colors">
                  Clear results
                </button>
              )}
            </div>

            {Array.isArray(results) && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
