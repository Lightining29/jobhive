import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaXTwitter, FaHexagonNodes, FaFire } from 'react-icons/fa6';
import { TRENDING_KEYWORDS_DATA } from '../../data/trendingKeywords';

const Footer = () => (
  <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 bg-slate-50 dark:bg-slate-900/90 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top 4-Column Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="relative h-9 w-9 flex items-center justify-center bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 rounded-xl text-slate-950 shadow-sm border border-amber-300 group-hover:scale-105 transition-transform duration-300">
              <FaHexagonNodes className="h-5 w-5 text-slate-950" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black text-slate-900 dark:text-white">Job Workplace</span>
              <span className="text-xs font-bold tracking-tight">
                <span className="text-red-600">Apple</span><span className="text-emerald-600">tree</span> <span className="text-slate-900 dark:text-slate-200">infotech</span>
              </span>
            </div>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">AI-powered job portal with smart recommendations from top sources.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-slate-900 dark:text-white">For Candidates</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Browse Jobs</Link></li>
            <li><Link to="/jobs/remote" className="hover:text-slate-900 dark:hover:text-white transition-colors">Remote Jobs</Link></li>
            <li><Link to="/jobs/technical" className="hover:text-slate-900 dark:hover:text-white transition-colors">Technical Jobs</Link></li>
            <li><Link to="/jobs/non-technical" className="hover:text-slate-900 dark:hover:text-white transition-colors">Non-Technical Jobs</Link></li>
            <li><Link to="/trending-keywords" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline transition-colors">Trending Keywords</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-slate-900 dark:text-white">For Recruiters</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/recruiter/post-job" className="hover:text-slate-900 dark:hover:text-white transition-colors">Post a Job</Link></li>
            <li><Link to="/recruiter/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruiter Dashboard</Link></li>
            <li><Link to="/auth/register" className="hover:text-slate-900 dark:hover:text-white transition-colors">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-slate-900 dark:text-white">Company & Founder</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/manish-kumar" className="font-bold text-amber-600 dark:text-cyan-400 hover:underline transition-colors">Manish Kumar (Lead Architect)</Link></li>
            <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/career-news" className="hover:text-slate-900 dark:hover:text-white transition-colors">Career News</Link></li>
            <li><Link to="/auth/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link></li>
            <li><Link to="/admin/dashboard" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors">Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* SEO Keyword Cluster: Trending Job Keywords */}
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <FaFire className="h-3.5 w-3.5 text-amber-500" />
            <span>Popular Job Searches & Trending Keywords</span>
          </div>
          <Link
            to="/trending-keywords"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            View All Trending Roles →
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          {TRENDING_KEYWORDS_DATA.map((k) => (
            <Link
              key={k.slug}
              to={`/jobs/keyword/${k.slug}`}
              className="hover:text-amber-600 dark:hover:text-cyan-300 transition-colors"
            >
              {k.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Copyright & Social */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Job Workplace (Appletree Infotech). All rights reserved.</p>
        <div className="flex gap-3 text-slate-500 dark:text-slate-400">
          <a href="#" aria-label="Twitter" className="hover:text-slate-900 dark:hover:text-white transition-colors"><FaXTwitter className="h-4 w-4" /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-slate-900 dark:hover:text-white transition-colors"><FaLinkedin className="h-4 w-4" /></a>
          <a href="#" aria-label="GitHub" className="hover:text-slate-900 dark:hover:text-white transition-colors"><FaGithub className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
