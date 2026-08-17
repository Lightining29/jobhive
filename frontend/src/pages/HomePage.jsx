import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCircleCheck,
  FaCirclePlus,
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

const JobRow = ({ jobs, loading, empty, cols = 4 }) => {
  if (loading) return <LoadingJobs count={cols} />;
  if (!jobs || jobs.length === 0) return <p className="text-muted text-sm py-8 text-center">{empty || 'No jobs available right now.'}</p>;
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
  const navigate = useNavigate();
  const { isNeon } = useTheme();

  const popular = ['Java', 'React', 'Marketing', 'Sales', 'Remote', 'Data Science'];

  return (
    <section className={`relative overflow-hidden transition-colors duration-500 ${isNeon ? 'bg-transparent' : 'bg-[#EEF2FF]'}`}>
      {!isNeon && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 45%, #FFFFFF 100%)' }}
          />
          <div
            className="aurora-blob animate-aurora -top-40 -left-32 h-[480px] w-[480px]"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(250,204,21,0.35) 0%, rgba(250,204,21,0) 65%)' }}
          />
          <div
            className="aurora-blob animate-aurora-2 top-1/4 -right-48 h-[560px] w-[560px]"
            style={{ background: 'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.15) 0%, rgba(224,231,255,0) 65%)' }}
          />
          <div
            className="aurora-blob animate-aurora-3 bottom-[-12rem] left-1/3 h-[420px] w-[420px]"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 60%)' }}
          />
          <div className="hero-grid absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.7)_0%,transparent_70%)]" />
        </>
      )}

      {isNeon && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_15%,rgba(0,240,255,0.2)_0%,transparent_75%)] pointer-events-none" />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-24 md:pb-32 text-center">
        <FadeIn>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border backdrop-blur-md shadow-sm ${
            isNeon
              ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.35)]'
              : 'border-[rgba(250,204,21,0.5)] bg-white/70 text-ink'
          }`}>
            <FaWandMagicSparkles className={`h-3.5 w-3.5 ${isNeon ? 'text-cyan-300 animate-pulse' : 'text-ink animate-pulse-soft'}`} />
            <span className="text-sm font-semibold">AI-powered job matching</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-ink leading-[1.08]">
            Find your{' '}
            <span
              className={
                isNeon
                  ? 'neon-font neon-glow-skyblue text-5xl md:text-7xl lg:text-8xl inline-block transform -rotate-1 px-3.5 py-1'
                  : 'text-glow-yellow'
              }
            >
              {isNeon ? 'Neon Light' : 'dream job'}
            </span>
            <br className="hidden md:block" /> {isNeon ? 'Opportunities' : 'today'}
          </h1>

          <p className={`text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed ${isNeon ? 'text-cyan-100/80 drop-shadow' : 'text-slate-600'}`}>
            Smart recommendations from the world's best job boards — matched to your skills,
            experience, and preferences. From India to remote worldwide.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/jobs?search=${encodeURIComponent(query)}`); }}
            className="mt-9 max-w-2xl mx-auto"
          >
            <div className={`flex items-center gap-2 rounded-2xl p-2 pl-5 border transition-all duration-300 ${
              isNeon
                ? 'bg-slate-900/65 backdrop-blur-xl border-2 border-cyan-400/70 shadow-[0_0_30px_rgba(0,240,255,0.4),inset_0_0_20px_rgba(0,240,255,0.1)] focus-within:border-cyan-300 focus-within:shadow-[0_0_50px_rgba(0,240,255,0.75)]'
                : 'bg-white border-slate-200 shadow-[0_20px_50px_rgba(99,102,241,0.12)] focus-within:ring-4 focus-within:ring-[rgba(250,204,21,0.35)] focus-within:shadow-[0_0_45px_rgba(250,204,21,0.35)]'
            }`}>
              <FaMagnifyingGlass className={`h-5 w-5 shrink-0 ${isNeon ? 'text-cyan-300' : 'text-slate-400'}`} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, company, or skill..."
                className={`flex-1 min-w-0 bg-transparent border-0 outline-none py-3 text-base md:text-lg ${isNeon ? 'text-white placeholder:text-cyan-300/50' : 'text-ink placeholder:text-slate-400'}`}
              />
              <button
                type="submit"
                className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-5 md:px-7 py-3 font-extrabold text-sm md:text-base transition-all duration-300 cursor-pointer ${
                  isNeon
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,240,255,0.85)] border border-cyan-200 hover:scale-105'
                    : 'bg-gradient-to-r from-accent to-accent-dark text-ink hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(250,204,21,0.45)]'
                }`}
              >
                <FaMagnifyingGlass className="h-4 w-4" />
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            <span className={`text-sm font-medium mr-1 ${isNeon ? 'text-cyan-300/80' : 'text-slate-500'}`}>Popular:</span>
            {popular.map((t) => (
              <Link
                key={t}
                to={`/jobs?search=${t}`}
                className={`text-sm px-4 py-1.5 rounded-full transition-all font-medium ${
                  isNeon
                    ? 'bg-cyan-950/40 border border-cyan-400/50 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:border-cyan-300 hover:bg-cyan-900/60 hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]'
                    : 'chip-glass text-slate-600 hover:text-ink hover:bg-[rgba(250,204,21,0.18)] hover:border-[rgba(250,204,21,0.5)]'
                }`}
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
              <div key={s.label} className={`flex items-center gap-3 md:gap-4 px-5 md:px-10 ${i > 0 ? (isNeon ? 'border-l border-cyan-400/30' : 'border-l border-ink/10') : ''}`}>
                <s.icon className={`h-5 w-5 shrink-0 ${isNeon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-ink'}`} />
                <div className="text-left">
                  <p className={`font-black text-lg md:text-2xl leading-none ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]' : 'text-ink'}`}>{s.value}</p>
                  <p className={`text-xs md:text-sm mt-1 ${isNeon ? 'text-cyan-200/70' : 'text-muted'}`}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Floating Badges */}
      <div className="hidden lg:block absolute left-2 top-28 animate-float rotate-2">
        <div className={`rounded-2xl px-4 py-3 flex items-center gap-2.5 transition-all ${
          isNeon
            ? 'bg-slate-950/30 border-1.5 border-cyan-400 shadow-[0_0_22px_rgba(0,240,255,0.45),inset_0_0_15px_rgba(0,240,255,0.1)] backdrop-blur-md'
            : 'glass-light'
        }`}>
          <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
            isNeon ? 'bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)] text-cyan-300' : 'bg-[rgba(250,204,21,0.2)] text-ink'
          }`}>
            <FaGlobe className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className={`text-sm font-black leading-tight ${isNeon ? 'text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]' : 'text-ink'}`}>Remote OK</p>
            <p className={`text-xs flex items-center gap-1 mt-0.5 ${isNeon ? 'text-cyan-200/80 drop-shadow-[0_0_4px_rgba(0,240,255,0.6)]' : 'text-muted'}`}>
              <FaCircleCheck className="h-3 w-3 text-emerald-400" /> verified roles
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-2 top-44 animate-float-2 -rotate-2">
        <div className={`rounded-2xl px-4 py-3 flex items-center gap-2.5 transition-all ${
          isNeon
            ? 'bg-slate-950/30 border-1.5 border-cyan-400 shadow-[0_0_22px_rgba(0,240,255,0.45),inset_0_0_15px_rgba(0,240,255,0.1)] backdrop-blur-md'
            : 'glass-light'
        }`}>
          <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
            isNeon ? 'bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.4)] text-cyan-300' : 'bg-[rgba(250,204,21,0.2)] text-ink'
          }`}>
            <FaSackDollar className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className={`text-sm font-black leading-tight ${isNeon ? 'text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]' : 'text-ink'}`}>₹12–20 LPA</p>
            <p className={`text-xs mt-0.5 ${isNeon ? 'text-cyan-200/80 drop-shadow-[0_0_4px_rgba(0,240,255,0.6)]' : 'text-muted'}`}>avg. top salary</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-2 top-72 animate-float-3 rotate-1">
        <div className={`rounded-2xl px-4 py-3 flex items-center gap-2.5 transition-all ${
          isNeon
            ? 'bg-slate-950/30 border-1.5 border-cyan-400 shadow-[0_0_22px_rgba(0,240,255,0.45),inset_0_0_15px_rgba(0,240,255,0.1)] backdrop-blur-md'
            : 'glass-light'
        }`}>
          <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
            isNeon ? 'bg-pink-500/25 border border-pink-400/60 shadow-[0_0_10px_rgba(255,0,127,0.4)] text-pink-300' : 'bg-[rgba(250,204,21,0.2)] text-ink'
          }`}>
            <FaFire className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className={`text-sm font-black leading-tight ${isNeon ? 'text-white drop-shadow-[0_0_8px_rgba(255,0,127,0.9)]' : 'text-ink'}`}>240+ jobs today</p>
            <p className={`text-xs mt-0.5 ${isNeon ? 'text-pink-200/80 drop-shadow-[0_0_4px_rgba(255,0,127,0.6)]' : 'text-muted'}`}>freshly posted</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute left-2 bottom-32 animate-float-4">
        <div className={`rounded-full pl-2.5 pr-4 py-2 flex items-center gap-2.5 transition-all ${
          isNeon
            ? 'bg-slate-950/30 border-1.5 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.45)] backdrop-blur-md'
            : 'glass-light'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className={`text-sm font-black ${isNeon ? 'text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]' : 'text-ink'}`}>Hiring now</span>
        </div>
      </div>

      {!isNeon && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      )}
    </section>
  );
};

const SectionHeader = ({ title, subtitle, to }) => {
  const { isNeon } = useTheme();
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <span className={`block h-1 w-12 rounded-full mb-3 ${isNeon ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.9)]' : 'bg-gradient-to-r from-accent to-accent-dark'}`} />
        <h2 className={`text-xl md:text-3xl font-black tracking-tight ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-ink'}`}>{title}</h2>
        {subtitle && <p className={`text-sm mt-1.5 ${isNeon ? 'text-cyan-200/70' : 'text-muted'}`}>{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className={`group inline-flex items-center gap-1.5 text-sm font-bold transition-all shrink-0 ${isNeon ? 'text-cyan-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-ink hover:text-ink'}`}>
          View all
          <FaArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};

const CandidateCTABand = () => {
  const { isNeon } = useTheme();
  return (
    <section className={`relative overflow-hidden border-t transition-colors duration-500 ${
      isNeon ? 'bg-transparent border-cyan-400/30' : 'bg-[#EEF2FF] border-slate-200'
    }`}>
      {!isNeon && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(120deg, #EEF2FF 0%, #E0E7FF 55%, #FFFFFF 100%)' }}
          />
          <div
            className="aurora-blob animate-aurora -top-24 right-1/4 h-72 w-72"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0) 65%)' }}
          />
          <div className="hero-grid absolute inset-0 opacity-40" />
        </>
      )}
      {isNeon && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(0,240,255,0.18)_0%,transparent_75%)] pointer-events-none" />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-ink tracking-tight leading-tight">
              Ready to find your{' '}
              <span className={isNeon ? 'neon-font neon-glow-skyblue text-3xl md:text-5xl px-2 inline-block' : 'text-glow-yellow'}>
                next opportunity
              </span>
              ?
            </h2>
            <p className={`mt-3 max-w-xl text-sm md:text-base leading-relaxed ${isNeon ? 'text-cyan-100/80' : 'text-slate-600'}`}>
              Explore thousands of verified jobs matched to your skills, experience, and preferred work mode across top tech companies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/jobs"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-extrabold transition-all duration-300 ${
                isNeon
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,240,255,0.85)] border border-cyan-200 hover:scale-105'
                  : 'bg-gradient-to-r from-accent to-accent-dark text-ink shadow-[0_10px_30px_rgba(250,204,21,0.35)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(250,204,21,0.5)]'
              }`}
            >
              <FaMagnifyingGlass className="h-4 w-4" />
              Explore All Jobs
            </Link>
            <Link
              to="/auth/register"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-8 py-3.5 text-base font-bold transition-all duration-300 ${
                isNeon
                  ? 'border-cyan-400/70 bg-slate-900/60 text-cyan-200 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:border-cyan-300 hover:text-white'
                  : 'border-primary-200 bg-white/70 text-ink hover:-translate-y-0.5 hover:bg-white hover:border-primary-300'
              }`}
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

  const companies = homeData?.topCompanies || [];
  const nearMe = homeData?.jobsNearMe || [];

  return (
    <div>
      <SearchHero />

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
                <div key={c._id} className="card card-hover p-5 flex flex-col items-center text-center group hover:border-accent/50">
                  <CompanyLogo logo={c.logo?.url} name={c.name} />
                  <p className="font-semibold text-sm mt-3 truncate w-full text-ink group-hover:text-ink transition-colors">{c.name}</p>
                  {c.industry && <p className="text-xs text-muted mt-0.5">{c.industry}</p>}
                  <span className="mt-3 h-0.5 w-0 bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-300 group-hover:w-8" />
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
                  className="card card-hover p-4 text-center group hover:border-accent/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/25 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <FaLocationDot className="h-5 w-5 text-ink" />
                  </div>
                  <p className="font-semibold text-sm text-ink group-hover:text-ink transition-colors">{l.city}</p>
                  <p className="text-xs text-muted mt-0.5">{l.count} jobs</p>
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
