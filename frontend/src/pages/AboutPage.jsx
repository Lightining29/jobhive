import { Link } from 'react-router-dom';
import { FaHexagonNodes, FaShieldHalved, FaBolt, FaUserCheck, FaGlobe, FaBriefcase, FaBuilding, FaHandshake, FaAward } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';
import { FadeIn } from '../components/ui/Motion';

export const AboutPage = () => {
  const { isNeon } = useTheme();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <section className={`relative overflow-hidden py-20 md:py-28 text-center transition-colors ${
        isNeon ? 'bg-transparent' : 'bg-gradient-to-b from-primary-50/50 via-white to-transparent'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border backdrop-blur-md ${
              isNeon
                ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                : 'border-accent/40 bg-accent/10 text-ink'
            }`}>
              <FaHexagonNodes className={`h-4 w-4 ${isNeon ? 'text-cyan-300' : 'text-accent-dark'}`} />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">About Job Workplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Bridging Talent with <br />
              <span className={isNeon ? 'neon-font neon-glow-skyblue inline-block px-2' : 'text-glow-yellow'}>
                Infinite Opportunity
              </span>
            </h1>

            <p className={`text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed ${
              isNeon ? 'text-cyan-100/80 drop-shadow' : 'text-slate-600'
            }`}>
              Job Workplace by Appletree Infotech is an AI-driven, next-generation career ecosystem designed to connect ambitious professionals with high-growth companies across India and worldwide.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Core Mission & Vision Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 transition-all hover:scale-[1.02]">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${
              isNeon ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-primary-50 text-primary'
            }`}>
              <FaBolt className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-sm leading-relaxed opacity-90">
              To eliminate friction in hiring through intelligent semantic matching, verified listings, and automated career tooling that saves time for both job seekers and recruiters.
            </p>
          </div>

          <div className="card p-8 transition-all hover:scale-[1.02]">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${
              isNeon ? 'bg-pink-500/20 border border-pink-400/60 text-pink-300 shadow-[0_0_15px_rgba(255,0,127,0.4)]' : 'bg-accent/20 text-accent-dark'
            }`}>
              <FaGlobe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Reach</h3>
            <p className="text-sm leading-relaxed opacity-90">
              From tech hubs in Bengaluru and Hyderabad to fully remote global positions, we bring together opportunities spanning technical, management, creative, and non-technical disciplines.
            </p>
          </div>

          <div className="card p-8 transition-all hover:scale-[1.02]">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${
              isNeon ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <FaShieldHalved className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Integrity & Trust</h3>
            <p className="text-sm leading-relaxed opacity-90">
              100% verified employer profiles, direct application tracking, and strict privacy safeguards ensuring your personal credentials and resume stay secure.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="card p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-line/40">
            <div className="pt-4 md:pt-0">
              <p className={`text-3xl sm:text-4xl font-black ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'text-ink'}`}>10,000+</p>
              <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Curated Job Openings</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className={`text-3xl sm:text-4xl font-black ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'text-ink'}`}>500+</p>
              <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Verified Companies</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className={`text-3xl sm:text-4xl font-black ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'text-ink'}`}>98.4%</p>
              <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Satisfaction Rate</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className={`text-3xl sm:text-4xl font-black ${isNeon ? 'text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'text-ink'}`}>24/7</p>
              <p className="text-xs sm:text-sm text-muted mt-1 font-medium">Real-Time Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight">Why Choose Job Workplace?</h2>
          <p className="text-sm text-muted mt-2">Built by engineers and recruiters for modern hiring standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isNeon ? 'bg-cyan-500/20 text-cyan-300' : 'bg-primary-50 text-primary'}`}>
              <FaBriefcase className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1">Tailored Job Matching</h4>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                Our smart search engine parses your core skills, experience level, and preferred compensation to deliver the most relevant openings instantly.
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isNeon ? 'bg-pink-500/20 text-pink-300' : 'bg-accent/20 text-accent-dark'}`}>
              <FaAward className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1">Verified Digital iCards</h4>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                Recruiters and candidates receive cryptographically verified digital iCards and candidate badges with instant QR authentication.
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isNeon ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
              <FaHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1">Direct Employer Interaction</h4>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                Connect directly with hiring managers and HR leads without third-party recruitment agency markups or hidden fees.
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isNeon ? 'bg-cyan-500/20 text-cyan-300' : 'bg-primary-50 text-primary'}`}>
              <FaUserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold mb-1">Career Insights & News</h4>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                Stay ahead of salary trends, market demands, and emerging industry developments with our curated Career News stream.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-14 text-center">
          <Link
            to="/jobs"
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              isNeon
                ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-105'
                : 'btn-primary'
            }`}
          >
            Explore All Openings
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
