import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBolt,
  FaBriefcase,
  FaBuilding,
  FaCircleCheck,
  FaChevronDown,
  FaChevronUp,
  FaCompass,
  FaFire,
  FaGlobe,
  FaGraduationCap,
  FaLayerGroup,
  FaLocationDot,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaSackDollar,
  FaShieldHalved,
  FaStar,
} from 'react-icons/fa6';
import { TRENDING_KEYWORDS_DATA, getKeywordBySlug } from '../data/trendingKeywords';
import { jobService } from '../services';
import JobCard from '../components/jobs/JobCard';
import SEOHead from '../components/seo/SEOHead';
import { formatSalary } from '../utils/format';

export const TrendingKeywordPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const keywordData = useMemo(() => {
    return getKeywordBySlug(slug) || TRENDING_KEYWORDS_DATA[0];
  }, [slug]);

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const fetchKeywordJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: keywordData.searchTerm,
        limit: 12,
        page: 1,
      };
      if (activeFilter === 'remote') params.workMode = 'remote';
      if (activeFilter === 'full-time') params.employmentType = 'full-time';
      if (activeFilter === 'internship') params.employmentType = 'internship';

      const res = await jobService.list(params);
      const fetched = res?.data?.jobs || [];
      setJobs(fetched);
      setTotalJobs(res?.data?.pagination?.total || fetched.length);
    } catch (err) {
      console.warn('Error fetching keyword jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [keywordData.searchTerm, activeFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchKeywordJobs();
  }, [fetchKeywordJobs]);

  // Related keywords
  const relatedKeywords = useMemo(() => {
    const slugs = keywordData.relatedSlugs || [];
    return slugs.map((s) => getKeywordBySlug(s)).filter(Boolean);
  }, [keywordData]);

  // JSON-LD Structured Data Schema (WebPage + FAQPage + BreadcrumbList + ItemList)
  const jsonLdSchema = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jobworkplace.com';
    const currentUrl = `${origin}/jobs/keyword/${keywordData.slug}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': currentUrl,
          'url': currentUrl,
          'name': keywordData.metaTitle,
          'description': keywordData.metaDescription,
          'inLanguage': 'en-US',
          'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': `${origin}/`,
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Trending Keywords',
                'item': `${origin}/trending-keywords`,
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': keywordData.name,
                'item': currentUrl,
              },
            ],
          },
        },
        {
          '@type': 'FAQPage',
          'mainEntity': (keywordData.faqs || []).map((faq) => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.answer,
            },
          })),
        },
        {
          '@type': 'ItemList',
          'name': `${keywordData.name} - Open Positions`,
          'numberOfItems': jobs.length,
          'itemListElement': jobs.slice(0, 8).map((job, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'url': `${origin}/jobs/${job._id}`,
            'name': `${job.jobTitle} at ${job.companyName}`,
          })),
        },
      ],
    };
  }, [keywordData, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title={keywordData.metaTitle}
        description={keywordData.metaDescription}
        keywords={keywordData.keywords}
        canonicalUrl={`https://jobworkplace.com/jobs/keyword/${keywordData.slug}`}
        schema={jsonLdSchema}
      />

      {/* Hero Banner with Futuristic Cyberpunk Ambient Aura */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-50 dark:from-cyan-950/20 dark:via-[#030712] dark:to-[#030712]">
        {/* Neon spheres */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation for SEO & UX */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-amber-600 dark:hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/trending-keywords" className="hover:text-amber-600 dark:hover:text-cyan-400 transition-colors">Trending Keywords</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{keywordData.shortName}</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 shadow-xs">
                <FaFire className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>{keywordData.badge}</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span>{keywordData.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {keywordData.h1}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {keywordData.overview}
              </p>
            </div>

            {/* Quick Telemetry Card */}
            <div className="w-full lg:w-80 shrink-0 p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-xl dark:shadow-[0_0_30px_rgba(0,240,255,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-cyan-500/20 pb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FaMoneyBillWave className="h-3.5 w-3.5 text-emerald-500" /> Average Salary
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{keywordData.averageSalary}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-cyan-500/20 pb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FaBriefcase className="h-3.5 w-3.5 text-cyan-500" /> Live Openings
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{keywordData.openingsCount}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-cyan-500/20 pb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FaGraduationCap className="h-3.5 w-3.5 text-amber-500" /> Experience
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{keywordData.experienceLevel}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FaGlobe className="h-3.5 w-3.5 text-purple-500" /> Work Modes
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{keywordData.workModes}</span>
              </div>
            </div>
          </div>

          {/* Quick Search Redirect Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter Jobs:</span>
            {['all', 'remote', 'full-time', 'internship'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-amber-400 text-slate-950 shadow-md dark:shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                }`}
              >
                {filter === 'all' ? 'All Roles' : filter}
              </button>
            ))}

            <Link
              to={`/jobs?search=${encodeURIComponent(keywordData.searchTerm)}`}
              className="ml-auto text-xs font-black text-amber-600 dark:text-cyan-300 hover:underline inline-flex items-center gap-1.5"
            >
              <FaMagnifyingGlass className="h-3 w-3" />
              Advanced Job Filters
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area: Live Jobs & Career Intelligence */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* 1. Live Job Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Live {keywordData.shortName} Openings ({totalJobs})
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified, non-expired positions hiring immediately across top employers
              </p>
            </div>
            <Link
              to={`/jobs?search=${encodeURIComponent(keywordData.searchTerm)}`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 hover:scale-105 transition-all shadow-md"
            >
              View All {keywordData.shortName} Jobs
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20 animate-pulse p-6"
                />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20">
              <FaBriefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No active {keywordData.shortName} jobs with filter: "{activeFilter}"
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Try switching to "All Roles" or browse our complete jobs catalog.
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-5 btn-primary !px-6 !py-2 text-xs"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* 2. Key Skills & Hiring Companies Intelligence */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Top In-Demand Skills */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300">
                <FaStar className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Core Skills In Demand</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Must-have proficiencies for {keywordData.shortName} roles</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywordData.topSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Top Hiring Companies */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300">
                <FaBuilding className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Companies Hiring</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Leading product firms and MNCs actively recruiting</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywordData.topCompanies.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-400/30"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Career Roadmap & Preparation Checklist */}
        {keywordData.careerRoadmap?.length > 0 && (
          <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
                <FaCompass className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Career Growth & Interview Checklist
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step roadmap to land high-paying {keywordData.shortName} positions
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {keywordData.careerRoadmap.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                >
                  <span className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Frequently Asked Questions (FAQPage Structured Data) */}
        {keywordData.faqs?.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions about {keywordData.shortName} Careers
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Everything you need to know regarding hiring trends, salaries, and technical interviews
              </p>
            </div>

            <div className="space-y-3">
              {keywordData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070e24] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    className="w-full px-6 py-4 text-left font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaqIndex === idx ? (
                      <FaChevronUp className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <FaChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {openFaqIndex === idx && (
                    <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Related Trending Keywords Cloud (Internal Link Equity) */}
        {relatedKeywords.length > 0 && (
          <section className="pt-8 border-t border-slate-200 dark:border-slate-800/80">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              Explore Related Trending Job Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {relatedKeywords.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/jobs/keyword/${rel.slug}`}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:text-cyan-300 transition-all shadow-xs"
                >
                  {rel.name} →
                </Link>
              ))}
              <Link
                to="/trending-keywords"
                className="px-4 py-2 rounded-2xl text-xs font-black bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 hover:scale-105 transition-all"
              >
                Browse All 30+ Trending Keywords Directory
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TrendingKeywordPage;
