import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCircleCheck,
  FaFire,
  FaGlobe,
  FaLocationDot,
  FaMagnifyingGlass,
  FaSackDollar,
  FaUsers,
  FaWandMagicSparkles,
} from 'react-icons/fa6';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import JobCard, { CompanyLogo } from '../components/jobs/JobCard';
import { FadeIn } from '../components/ui/Motion';
import { LoadingJobs } from '../components/ui/States';
import SEOHead from '../components/seo/SEOHead';
import DarkHeroParallaxScene from '../components/home/DarkHeroParallaxScene';
import AlternateJobsMarquee from '../components/home/AlternateJobsMarquee';

const JobRow = ({ jobs, loading, empty, cols = 4 }) => {
  if (loading) return <LoadingJobs count={cols} />;
  if (!jobs || jobs.length === 0) return <p className="text-slate-500 text-sm py-8 text-center">{empty || 'No jobs available right now.'}</p>;
  const gridCols = cols === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} match={job.match?.score} />
      ))}
    </div>
  );
};

const SearchHero = () => {
  const [query, setQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  const popular = ['Java', 'React', 'Marketing', 'Sales', 'Remote', 'Data Science'];

  useState(() => {
    const onScroll = () => {
      setScrollY(window.scrollY || 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  return (
    <section className="relative overflow-hidden bg-[#EEF2FF] dark:bg-[#070B14] transition-colors duration-300">
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 45%, #FFFFFF 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(180deg, #0B0F19 0%, #111827 50%, #070B14 100%)',
        }}
      />
      <div
        className="aurora-blob animate-aurora -top-40 -left-32 h-[480px] w-[480px] will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.12}px)`,
          background: 'radial-gradient(circle at 30% 30%, rgba(250,204,21,0.35) 0%, rgba(250,204,21,0) 65%)',
        }}
      />
      <div
        className="aurora-blob animate-aurora-2 top-1/4 -right-48 h-[560px] w-[560px] will-change-transform"
        style={{
          transform: `translateY(${scrollY * -0.15}px)`,
          background: 'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.2) 0%, rgba(224,231,255,0) 65%)',
        }}
      />
      <div
        className="aurora-blob animate-aurora-3 bottom-[-12rem] left-1/3 h-[420px] w-[420px] will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.08}px)`,
          background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 60%)',
        }}
      />
      <div className="hero-grid absolute inset-0 opacity-60 dark:opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.7)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-24 md:pb-32 text-center z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border border-amber-300 dark:border-amber-400/30 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs">
            <FaWandMagicSparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse-soft" />
            <span className="text-sm font-semibold">AI-powered job matching</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] relative z-10">
            Find your{' '}
            <span className="text-glow-yellow text-primary-600 dark:text-amber-400">
              dream job
            </span>
            <br className="hidden md:block" /> today
          </h1>

          <p className="text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
            Smart recommendations from the world's best job boards — matched to your skills,
            experience, and preferences. From India to remote worldwide.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/jobs?search=${encodeURIComponent(query)}`); }}
            className="mt-9 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 rounded-full p-2 pl-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(99,102,241,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-950 focus-within:border-primary-400 dark:focus-within:border-primary-600 transition-all duration-300">
              <FaMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, company, or skill..."
                className="flex-1 min-w-0 bg-transparent !border-none !outline-none !shadow-none py-3 text-base md:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 md:px-8 py-3.5 font-extrabold text-sm md:text-base bg-amber-400 hover:bg-amber-300 text-slate-950 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-md border border-amber-300"
              >
                <FaMagnifyingGlass className="h-4 w-4 text-slate-950" />
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            <span className="text-sm font-medium mr-1 text-slate-500 dark:text-slate-400">Popular:</span>
            {popular.map((t) => (
              <Link
                key={t}
                to={`/jobs?search=${t}`}
                className="text-sm px-4 py-1.5 rounded-full transition-all font-medium chip-glass bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-slate-800"
              >
                {t}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center mt-10">
            {[
              { icon: FaBriefcase, value: '10,000+', label: 'Jobs' },
              { icon: FaBuilding, value: '500+', label: 'Companies' },
              { icon: FaUsers, value: '2,000+', label: 'Hires' },
            ].map((s, i) => (
              <div key={s.label} className={`flex items-center gap-3 md:gap-4 px-5 md:px-10 ${i > 0 ? 'border-l border-slate-200 dark:border-slate-800' : ''}`}>
                <s.icon className="h-5 w-5 shrink-0 text-primary-600 dark:text-amber-400" />
                <div className="text-left">
                  <p className="font-black text-lg md:text-2xl leading-none text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs md:text-sm mt-1 text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Floating Parallax Badges */}
      <div
        className="hidden lg:block absolute left-6 top-28 will-change-transform"
        style={{
          transform: `translateY(${scrollY * -0.18}px) rotate(2deg)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
            <FaGlobe className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className="text-sm font-black leading-tight text-slate-900 dark:text-white">Remote OK</p>
            <p className="text-xs flex items-center gap-1 mt-0.5 text-slate-500 dark:text-slate-400">
              <FaCircleCheck className="h-3 w-3 text-emerald-500" /> verified roles
            </p>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block absolute right-6 top-44 will-change-transform"
        style={{
          transform: `translateY(${scrollY * -0.25}px) rotate(-2deg)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <FaSackDollar className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className="text-sm font-black leading-tight text-slate-900 dark:text-white">₹12–20 LPA</p>
            <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">avg. top salary</p>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block absolute right-8 top-72 will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.15}px) rotate(1deg)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <FaFire className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className="text-sm font-black leading-tight text-slate-900 dark:text-white">240+ jobs today</p>
            <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">freshly posted</p>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block absolute left-8 bottom-32 will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div className="rounded-full pl-2.5 pr-4 py-2 flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/80 dark:border-slate-700/70 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Hiring now</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] dark:from-[#0A0E17] to-transparent transition-colors duration-300" />
    </section>
  );
};

const SectionHeader = ({ title, subtitle, to }) => {
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

const CandidateCTABand = () => {
  return (
    <section className="relative overflow-hidden border-t bg-[#EEF2FF] dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(120deg, #EEF2FF 0%, #E0E7FF 55%, #FFFFFF 100%)' }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(120deg, #0B0F19 0%, #111827 55%, #0F172A 100%)' }}
      />
      <div
        className="aurora-blob animate-aurora -top-24 right-1/4 h-72 w-72"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0) 65%)' }}
      />
      <div className="hero-grid absolute inset-0 opacity-40 dark:opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Ready to find your{' '}
              <span className="text-primary-600 dark:text-amber-400">
                next opportunity
              </span>
              ?
            </h2>
            <p className="mt-3 max-w-xl text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Explore thousands of verified jobs matched to your skills, experience, and preferred work mode across top tech companies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/jobs"
              className="btn-primary !px-8 !py-3.5 text-base font-extrabold shadow-md flex items-center justify-center gap-2"
            >
              <FaMagnifyingGlass className="h-4 w-4" />
              Explore All Jobs
            </Link>
            <Link
              to="/auth/register"
              className="btn-outline !px-8 !py-3.5 text-base font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
            >
              Create Free Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const { homeData, homeLoading } = useJobs();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const companies = homeData?.topCompanies || [];
  const nearMe = homeData?.jobsNearMe || [];

  return (
    <div>
      <SEOHead
        title="Job Workplace - Find Dream Jobs, Java & Tech Careers, Remote Work"
        description="Search 10,000+ verified job openings in Java, Python, React, Remote & Non-Technical fields. AI-powered matching from top companies and high-growth startups."
        keywords={['jobs', 'java jobs', 'java developer', 'software engineer jobs', 'remote jobs', 'tech jobs', 'hiring', 'fresher jobs', 'internships']}
      />

      {/* Dynamic Hero: High-Tech Cyberpunk Parallax Scene in Dark Mode, Smooth Aurora in Light Mode */}
      {isDark ? <DarkHeroParallaxScene /> : <SearchHero />}

      {/* Dual-Direction Alternate Horizontal Scrolling Jobs Marquee with Blurry Glass & Neon Borders */}
      <AlternateJobsMarquee
        row1Jobs={homeData?.latest || []}
        row2Jobs={homeData?.trending || homeData?.highestPaying || []}
        title="Active Opportunity Telemetry"
        subtitle="Infinite live streams of verified tech, remote, and high-growth positions"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
        {homeData?.recommended?.length > 0 && (
          <section>
            <SectionHeader title="AI Recommended for You" subtitle="Hand-picked by our AI engine based on your skills and preferences" to="/jobs/recommended" />
            <JobRow jobs={homeData.recommended} loading={false} empty="Complete your profile to get AI recommendations." />
          </section>
        )}

        <section>
          <SectionHeader title="Latest Jobs" subtitle="Fresh opportunities posted in the last few days" to="/jobs" />
          <JobRow jobs={homeData?.latest} loading={homeLoading} />
        </section>

        <section>
          <SectionHeader title="Trending Jobs" subtitle="What people are applying to right now" to="/jobs?sort=trending" />
          <JobRow jobs={homeData?.trending} loading={homeLoading} />
        </section>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          <section>
            <SectionHeader title="Technical Jobs" to="/jobs/technical" />
            <JobRow jobs={homeData?.technical} loading={homeLoading} cols={2} />
          </section>
          <section>
            <SectionHeader title="Non-Technical Jobs" to="/jobs/non-technical" />
            <JobRow jobs={homeData?.nonTechnical} loading={homeLoading} cols={2} />
          </section>
        </div>

        <section>
          <SectionHeader title="Remote Jobs" subtitle="Work from anywhere — top remote roles" to="/jobs/remote" />
          <JobRow jobs={homeData?.remote} loading={homeLoading} />
        </section>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          <section>
            <SectionHeader title="Internships" to="/jobs?experience=internship" />
            <JobRow jobs={homeData?.internship} loading={homeLoading} cols={2} />
          </section>
          <section>
            <SectionHeader title="Fresher Jobs" to="/jobs?experience=fresher" />
            <JobRow jobs={homeData?.fresher} loading={homeLoading} cols={2} />
          </section>
        </div>

        <section>
          <SectionHeader title="Highest Paying Jobs" to="/jobs?sort=salary" />
          <JobRow jobs={homeData?.highestPaying} loading={homeLoading} />
        </section>

        {companies.length > 0 && (
          <section>
            <SectionHeader title="Featured Companies" subtitle="Companies hiring on JobHive" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {companies.map((c) => (
                <div key={c._id} className="card card-hover p-5 flex flex-col items-center text-center group hover:border-primary-300 dark:hover:border-primary-500/40">
                  <CompanyLogo logo={c.logo?.url} name={c.name} />
                  <p className="font-semibold text-sm mt-3 truncate w-full text-slate-900 dark:text-white transition-colors">{c.name}</p>
                  {c.industry && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.industry}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {nearMe.length > 0 && (
          <section>
            <SectionHeader title="Jobs Near Me" subtitle="Popular job locations" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {nearMe.map((l) => (
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
          </section>
        )}
      </div>

      <CandidateCTABand />
    </div>
  );
};

export default HomePage;
