import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaBriefcase,
  FaBuilding,
  FaFire,
  FaGraduationCap,
  FaLayerGroup,
  FaLocationDot,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaRocket,
  FaStar,
} from 'react-icons/fa6';
import { TRENDING_KEYWORDS_DATA } from '../data/trendingKeywords';
import SEOHead from '../components/seo/SEOHead';

export const TrendingKeywordsHubPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(TRENDING_KEYWORDS_DATA.map((k) => k.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredKeywords = useMemo(() => {
    return TRENDING_KEYWORDS_DATA.filter((k) => {
      const matchCat = selectedCategory === 'all' || k.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.searchTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.topSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Structured Data Schema for Directory Page
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Trending Job Keywords Directory (2026) - In-Demand Tech & Business Roles',
    'description': 'Explore high-demand career keywords in Java, Python, React, DevOps, Cloud, AI, and Freshers. Compare salary benchmarks and hiring companies.',
    'url': 'https://jobworkplace.com/trending-keywords',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': TRENDING_KEYWORDS_DATA.map((k, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'url': `https://jobworkplace.com/jobs/keyword/${k.slug}`,
        'name': k.name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title="Trending Job Keywords Directory (2026) - In-Demand Tech, Remote & Fresher Roles"
        description="Explore the top trending job keywords in Java, Python, React, Cloud, AI/ML, DevOps, and Fresher roles. Compare salaries, required skills, and apply directly."
        keywords={['trending job keywords', 'top tech jobs india', 'java developer jobs', 'python developer jobs', 'remote software engineer', 'fresher it jobs']}
        canonicalUrl="https://jobworkplace.com/trending-keywords"
        schema={jsonLdSchema}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-14 pb-16 md:pt-18 md:pb-20 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-50 dark:from-cyan-950/20 dark:via-[#030712] dark:to-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 mb-4 shadow-xs">
            <FaFire className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
            <span>High-Velocity Career Index</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Trending Job Keywords & In-Demand Roles
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-2xl mx-auto">
            Deep-dive into verified salary benchmarks, must-have skills, hiring companies, and live openings across top technology domains.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword, skill, or role (e.g. Java, Python, Remote, Bangalore)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-300 dark:border-cyan-500/30 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-lg focus:outline-hidden focus:ring-2 focus:ring-amber-400 dark:focus:ring-cyan-400 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-md dark:shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                }`}
              >
                {cat === 'all' ? 'All Domains' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Keywords */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKeywords.map((keyword) => (
            <Link
              key={keyword.slug}
              to={`/jobs/keyword/${keyword.slug}`}
              className="group p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 hover:border-amber-400 dark:hover:border-cyan-400 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                    {keyword.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {keyword.openingsCount} Openings
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-cyan-300 transition-colors">
                  {keyword.name}
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {keyword.overview}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Avg Salary:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{keyword.averageSalary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Experience:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{keyword.experienceLevel}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {keyword.topSkills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-cyan-300"
                    >
                      {s}
                    </span>
                  ))}
                  {keyword.topSkills.length > 4 && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-400">
                      +{keyword.topSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-black text-amber-600 dark:text-cyan-300">
                <span>View Complete Guide & Jobs</span>
                <FaArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingKeywordsHubPage;
