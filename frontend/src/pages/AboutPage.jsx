import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHexagonNodes,
  FaShieldHalved,
  FaBolt,
  FaGlobe,
  FaBriefcase,
  FaBuilding,
  FaHandshake,
  FaAward,
  FaCheck,
  FaCircleQuestion,
  FaChevronDown,
  FaUsers,
  FaCode,
  FaArrowRight,
  FaChartPie,
  FaLock,
  FaGraduationCap,
  FaCompass,
} from 'react-icons/fa6';
import { FadeIn } from '../components/ui/Motion';
import SEOHead from '../components/seo/SEOHead';

export const AboutPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is Job Workplace and how does it help job seekers?',
      a: 'Job Workplace is an AI-powered next-generation employment platform created by Appletree Infotech. It provides semantic job matching, AI resume ATS analysis, verified employer listings, and digital credential verification to help professionals find their dream jobs faster and without middleman friction.',
    },
    {
      q: 'How does the AI Job Matching algorithm work?',
      a: 'Our proprietary semantic AI engine compares candidate profiles, technical skills, domain experience, and career preferences with live job descriptions to deliver precision match scores, highlighting top-fit roles tailored specifically to each candidate.',
    },
    {
      q: 'Are job listings on Job Workplace verified?',
      a: 'Yes, 100%. We employ direct employer validation, corporate email authentication, and anti-fraud heuristics to eliminate fake listings, ghost jobs, and unauthorized spam postings.',
    },
    {
      q: 'Is Job Workplace free for candidates?',
      a: 'Yes, searching for jobs, applying to openings, generating digital I-Cards, and analyzing resumes with our core AI tools is completely free for job seekers.',
    },
    {
      q: 'What industries and roles are available on Job Workplace?',
      a: 'We host openings across Java Development, Full Stack, Python, Cloud/DevOps, Data Science, AI/ML, UI/UX Design, Product Management, as well as Non-Technical fields like Sales, Marketing, HR, and Operations spanning On-Site, Hybrid, and Remote work.',
    },
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://jobworkplace.com/about#webpage',
        'url': 'https://jobworkplace.com/about',
        'name': 'About Job Workplace - Leading AI Career Platform & Tech Job Portal',
        'description': 'Discover Job Workplace by Appletree Infotech - India\'s fastest-growing AI-powered job matching ecosystem connecting developers, engineers, and professionals with top global employers.',
        'isPartOf': {
          '@type': 'WebSite',
          '@id': 'https://jobworkplace.com/#website',
          'name': 'Job Workplace',
          'url': 'https://jobworkplace.com/',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://jobworkplace.com/#organization',
        'name': 'Job Workplace',
        'legalName': 'Job Workplace by Appletree Infotech',
        'url': 'https://jobworkplace.com/',
        'logo': 'https://jobworkplace.com/favicon.svg',
        'description': 'AI-driven employment marketplace connecting candidates with verified tech & non-tech job opportunities worldwide.',
        'foundingDate': '2024',
        'knowsAbout': [
          'Employment Matching',
          'Artificial Intelligence in Recruitment',
          'Resume ATS Scoring',
          'Software Developer Jobs',
          'Remote Work Opportunities',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://jobworkplace.com/about#faq',
        'mainEntity': faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50 dark:bg-[#070B14] transition-colors duration-300">
      <SEOHead
        title="About Us - Leading AI Career Platform & Job Portal"
        description="Discover Job Workplace by Appletree Infotech. India's fastest-growing AI career ecosystem connecting developers and professionals with verified openings across tech, remote, and non-tech industries."
        keywords={[
          'about job workplace',
          'job workplace',
          'job portal India',
          'AI hiring platform',
          'tech career platform',
          'appletree infotech hiring',
          'software engineering jobs',
          'verified employer network',
          'remote careers',
          'java jobs portal',
        ]}
        schema={aboutSchema}
      />

      {/* ── 1. Hero Header ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 text-center bg-gradient-to-b from-primary-50/70 via-white to-transparent dark:from-slate-900/70 dark:via-slate-900/20 dark:to-transparent border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-primary-200 dark:border-primary-800 bg-white/90 dark:bg-slate-900/90 text-primary-700 dark:text-primary-300 shadow-xs">
              <FaHexagonNodes className="h-4 w-4 text-primary-600 dark:text-amber-400 animate-pulse-soft" />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">About Job Workplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Transforming How The World <br />
              <span className="text-primary-600 dark:text-amber-400">Discovers Great Work</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
              Job Workplace by Appletree Infotech is an AI-powered talent marketplace engineered to connect ambitious professionals with verified, high-growth companies across India and worldwide.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link to="/jobs" className="btn-primary !px-8 !py-3.5 text-base font-bold shadow-md rounded-xl inline-flex items-center gap-2">
                Explore 10,000+ Jobs
                <FaArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth/register" className="btn-outline !px-8 !py-3.5 text-base font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
                Join As Candidate
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 2. Real-Time Impact Counters ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="card p-8 sm:p-10 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">10,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold tracking-wide uppercase">Curated Live Jobs</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-600 dark:text-amber-400">500+</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold tracking-wide uppercase">Verified Employers</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400">98.4%</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold tracking-wide uppercase">Candidate Satisfaction</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-500 dark:text-amber-300">24/7</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold tracking-wide uppercase">AI Match Engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Core Mission & Vision ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-amber-400 bg-primary-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-primary-100 dark:border-slate-700">
            Our Purpose
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
            Built To Eliminate Hiring Friction
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
            Traditional job boards are noisy, outdated, and filled with ghost postings. We built Job Workplace to bring clarity and speed back to hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-500/40 transition-all hover:shadow-lg rounded-2xl">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shadow-xs">
              <FaBolt className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Semantic AI Matching</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              We go beyond rigid keyword searches. Our context-aware AI scores candidates based on actual technical proficiencies, project depth, and genuine suitability.
            </p>
          </div>

          <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-500/40 transition-all hover:shadow-lg rounded-2xl">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-xs">
              <FaGlobe className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Global & Local Scale</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Connecting talent from India’s premier tech corridors (Bengaluru, Hyderabad, Pune, NCR) to high-paying remote roles with startups and enterprises worldwide.
            </p>
          </div>

          <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/40 transition-all hover:shadow-lg rounded-2xl">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <FaShieldHalved className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Zero Ghost Jobs</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Every employer account is manually vetted and verified. No third-party spam aggregators, no stale listings, and direct recruiter transparency.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Key Feature Pillars ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-300 bg-primary-900/60 px-3 py-1 rounded-full border border-primary-500/30">
              Platform Innovations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">
              Next-Generation Career Architecture
            </h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
              Everything job seekers and talent acquisition teams need to navigate modern tech careers seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 text-primary-300">
                <FaCode className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">ATS Resume Scoring</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Instant AI diagnostics on format, keyword density, and actionable suggestions to clear corporate Applicant Tracking Systems.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-300">
                <FaAward className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Digital I-Card Verification</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cryptographically verifiable professional smart cards providing instant validation of credentials and identity for recruiters.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 text-amber-300">
                <FaChartPie className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Market Salary Insights</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Real-time salary benchmarks for Java, Python, Cloud, and Product roles across different experience brackets and cities.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-300">
                <FaCompass className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Precision Search Filters</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Instant filtering by Work Mode (Remote, Hybrid, On-site), Experience Level (Fresher, Mid, Senior), and Compensation.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4 text-rose-300">
                <FaLock className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Candidate Data Privacy</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Complete control over your visibility. Your contact information and resume are protected from unauthorized scraping.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-300">
                <FaHandshake className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-white">Direct Recruiter Messages</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect directly with hiring managers without intermediate placement consultants or recruitment agencies taking cuts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Frequently Asked Questions (FAQ) Section with Rich Schema ─ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-amber-400 bg-primary-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-primary-100 dark:border-slate-700">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
            Everything you need to know about Job Workplace and how our platform works.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`card bg-white dark:bg-slate-900 border transition-all rounded-2xl overflow-hidden ${
                  isOpen ? 'border-primary-300 dark:border-amber-400/50 shadow-md ring-2 ring-primary-50 dark:ring-amber-400/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <FaCircleQuestion className="h-5 w-5 text-primary-600 dark:text-amber-400 shrink-0" />
                    {faq.q}
                  </span>
                  <FaChevronDown
                    className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-primary-600 dark:text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-50 dark:border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. Bottom High-Converting CTA ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-24 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">
              Ready To Launch Your Next Career Move?
            </h2>
            <p className="text-sm sm:text-base text-primary-100 max-w-xl mx-auto mb-8 leading-relaxed">
              Join thousands of software engineers, product managers, and professionals discovering opportunities on Job Workplace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/jobs"
                className="btn bg-white text-primary-700 hover:bg-primary-50 !px-8 !py-4 font-black shadow-lg rounded-xl text-base transition-all hover:scale-105"
              >
                Browse All Openings
              </Link>
              <Link
                to="/auth/register"
                className="btn border-2 border-white text-white hover:bg-white/10 !px-8 !py-4 font-bold rounded-xl text-base transition-all"
              >
                Create Candidate Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
