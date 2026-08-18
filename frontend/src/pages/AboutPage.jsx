import { Link } from 'react-router-dom';
import { FaHexagonNodes, FaShieldHalved, FaBolt, FaGlobe, FaBriefcase, FaBuilding, FaHandshake, FaAward } from 'react-icons/fa6';
import { FadeIn } from '../components/ui/Motion';
import SEOHead from '../components/seo/SEOHead';

export const AboutPage = () => {
  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      <SEOHead
        title="About Us - Leading Job Portal & Career Tech Platform"
        description="Learn how Job Workplace connects thousands of developers and professionals with top companies across India and worldwide through AI-driven hiring."
        keywords={['about job workplace', 'job portal India', 'AI hiring platform', 'tech careers']}
      />
      {/* Hero Header */}
      <section className="relative overflow-hidden py-20 md:py-28 text-center bg-gradient-to-b from-primary-50/60 via-white to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-primary-200 bg-primary-50/80 text-primary-700">
              <FaHexagonNodes className="h-4 w-4 text-primary-600" />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">About Job Workplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Bridging Talent with <br />
              <span className="text-primary-600">
                Infinite Opportunity
              </span>
            </h1>

            <p className="text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed text-slate-600">
              Job Workplace by Appletree Infotech is an AI-driven, next-generation career ecosystem designed to connect ambitious professionals with high-growth companies across India and worldwide.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Core Mission & Vision Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 bg-white transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 bg-primary-50 text-primary-600">
              <FaBolt className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Our Mission</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              To eliminate friction in hiring through intelligent semantic matching, verified listings, and automated career tooling that saves time for both job seekers and recruiters.
            </p>
          </div>

          <div className="card p-8 bg-white transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 bg-amber-50 text-amber-600">
              <FaGlobe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Global Reach</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              From tech hubs in Bengaluru and Hyderabad to fully remote global positions, we bring together opportunities spanning technical, management, creative, and non-technical disciplines.
            </p>
          </div>

          <div className="card p-8 bg-white transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 text-emerald-600">
              <FaShieldHalved className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Integrity & Trust</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              100% verified employer profiles, direct application tracking, and strict privacy safeguards ensuring your personal credentials and resume stay secure.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="card p-8 sm:p-12 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">10,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Curated Job Openings</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">500+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Verified Companies</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">98.4%</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Satisfaction Rate</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">24/7</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Platform Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900">Why Job Seekers & Employers Choose Us</h2>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Modern hiring workflows built for precision, speed, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 flex gap-4 bg-white">
            <div className="p-3 rounded-xl shrink-0 bg-primary-50 text-primary-600">
              <FaAward className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1 text-slate-900">AI-Powered Resume Analysis</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload your resume and get instant feedback, keyword match scoring, and personalized tips to beat ATS filters.
              </p>
            </div>
          </div>

          <div className="card p-6 flex gap-4 bg-white">
            <div className="p-3 rounded-xl shrink-0 bg-amber-50 text-amber-600">
              <FaHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1 text-slate-900">Direct Recruiter Connections</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Skip third-party job aggregators and reach hiring decision-makers directly with real-time status notifications.
              </p>
            </div>
          </div>

          <div className="card p-6 flex gap-4 bg-white">
            <div className="p-3 rounded-xl shrink-0 bg-emerald-50 text-emerald-600">
              <FaBriefcase className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1 text-slate-900">Smart Job Alerts</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive instant emails and in-app alerts whenever new positions matching your exact criteria get published.
              </p>
            </div>
          </div>

          <div className="card p-6 flex gap-4 bg-white">
            <div className="p-3 rounded-xl shrink-0 bg-primary-50 text-primary-600">
              <FaBuilding className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1 text-slate-900">Digital I-Card Verification</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Showcase verified skills and identity with downloadable smart cards backed by secure verification hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-20 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-primary-600 text-white shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black mb-3">
            Start Your Next Chapter Today
          </h2>
          <p className="text-sm sm:text-base text-primary-100 max-w-xl mx-auto mb-8">
            Join thousands of professionals advancing their careers through Job Workplace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/jobs" className="btn bg-white text-primary-700 hover:bg-primary-50 !px-8 !py-3.5 font-bold shadow-md rounded-xl">
              Browse Openings
            </Link>
            <Link to="/auth/register" className="btn border-2 border-white/80 text-white hover:bg-white/10 !px-8 !py-3.5 font-bold rounded-xl">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
