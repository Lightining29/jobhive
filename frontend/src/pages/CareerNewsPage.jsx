import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNewspaper, FaArrowRotateRight, FaWandMagicSparkles,
  FaArrowUpRightFromSquare, FaCircleCheck, FaFire,
  FaClock, FaChartLine, FaLightbulb,
} from 'react-icons/fa6';
import { useTitle } from '../hooks';
import api from '../services/api';
import SEOHead from '../components/seo/SEOHead';

const CATEGORY_COLORS = {
  'Hiring':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Trends':     'bg-blue-50 text-blue-700 border-blue-200',
  'Remote Work':'bg-violet-50 text-violet-700 border-violet-200',
  'AI & Tech':  'bg-amber-50 text-amber-700 border-amber-200',
  'Salary':     'bg-rose-50 text-rose-700 border-rose-200',
};

const CATEGORY_ICONS = {
  'Hiring':     FaCircleCheck,
  'Trends':     FaChartLine,
  'Remote Work':FaArrowRotateRight,
  'AI & Tech':  FaWandMagicSparkles,
  'Salary':     FaFire,
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CareerNewsPage() {
  useTitle('Career News');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(`/news/career${refresh ? '?refresh=true' : ''}`);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ['All', ...Object.keys(CATEGORY_COLORS)];

  const filtered = data?.articles?.filter(
    (a) => activeCategory === 'All' || a.category === activeCategory
  ) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title="AI Career News & Tech Hiring Trends"
        description="Stay ahead with real-time AI-summarized tech hiring trends, engineering salaries, remote work shifts, and company expansion news."
        keywords={['career news', 'tech hiring trends', 'engineering salary trends', 'IT jobs news']}
      />
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <FaNewspaper className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink">AI Career News</h1>
            <span className="badge badge-primary !text-[10px]">AI Summarized</span>
          </div>
          <p className="text-sm text-muted ml-13">
            Latest tech hiring trends, salary insights, and career news
            {data?.fetchedAt && (
              <span className="ml-2 text-[11px]">
                <FaClock className="inline h-2.5 w-2.5 mr-0.5" />
                Updated {timeAgo(data.fetchedAt)}
                {data.cached && ' (cached)'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="btn-outline !py-2 gap-2 shrink-0"
        >
          <FaArrowRotateRight className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="card p-5 skeleton h-36" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card p-4 skeleton h-40" />)}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card p-8 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button onClick={() => load()} className="btn-primary">Try Again</button>
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <div className="space-y-6">
          {/* AI Insights panel */}
          {data.aiInsights && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 bg-gradient-to-br from-primary-50 to-violet-50 border-primary-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaWandMagicSparkles className="h-4 w-4 text-primary-600" />
                <p className="text-sm font-bold text-ink">AI Market Summary</p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                {data.aiInsights.marketSummary}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Trends */}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Key Trends
                  </p>
                  <ul className="space-y-1.5">
                    {(data.aiInsights.trends || []).map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <FaChartLine className="h-3 w-3 text-primary-500 mt-0.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tip */}
                {data.aiInsights.tip && (
                  <div className="bg-white/70 rounded-xl p-3 border border-primary-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FaLightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <p className="text-xs font-semibold text-ink">Career Tip</p>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {data.aiInsights.tip}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat !== 'All' ? (CATEGORY_ICONS[cat] || FaNewspaper) : FaNewspaper;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-muted border-line hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {cat}
                  {cat === 'All' && (
                    <span className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted'}`}>
                      {data.articles?.length || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Articles grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.length === 0 ? (
                <div className="md:col-span-3 card p-8 text-center">
                  <p className="text-sm text-muted">No articles in this category right now.</p>
                </div>
              ) : (
                filtered.map((article, i) => (
                  <ArticleCard key={`${article.title}-${i}`} article={article} index={i} />
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer note */}
          <p className="text-center text-xs text-muted py-2">
            Sources: Google News RSS &bull; Refreshes every 30 minutes
          </p>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, index }) {
  const catStyle = CATEGORY_COLORS[article.category] || 'bg-slate-50 text-slate-600 border-line';
  const CatIcon  = CATEGORY_ICONS[article.category]  || FaNewspaper;

  return (
    <motion.a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card card-hover p-4 flex flex-col gap-3 group cursor-pointer"
    >
      {/* Category + time */}
      <div className="flex items-center justify-between gap-2">
        <span className={`badge border text-[10px] !px-2 !py-0.5 flex items-center gap-1 ${catStyle}`}>
          <CatIcon className="h-2.5 w-2.5" />
          {article.category}
        </span>
        <span className="text-[10px] text-muted flex items-center gap-1 shrink-0">
          <FaClock className="h-2.5 w-2.5" />
          {timeAgo(article.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-ink leading-snug group-hover:text-primary-600 transition-colors line-clamp-3">
        {article.title}
      </h3>

      {/* Description */}
      {article.description && (
        <p className="text-xs text-muted leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-line">
        <span className="text-[10px] text-muted truncate max-w-[70%]">
          {article.source || 'News'}
        </span>
        <FaArrowUpRightFromSquare className="h-3 w-3 text-muted group-hover:text-primary-600 transition-colors shrink-0" />
      </div>
    </motion.a>
  );
}
