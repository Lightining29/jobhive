import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';

const Footer = () => (
  <footer className="border-t border-line mt-16 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="relative h-8 w-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FaHexagonNodes className="h-8 w-8 text-ink drop-shadow-sm" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
              </span>
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black text-ink">Job Workplace</span>
              <span className="text-xs font-bold tracking-tight">
                <span className="text-red-600">Apple</span><span className="text-emerald-600">tree</span> <span className="text-black">infotech</span>
              </span>
            </div>
          </Link>
          <p className="text-sm text-muted mt-3">AI-powered job portal with smart recommendations from top sources.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-ink">For Candidates</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/jobs" className="hover:text-ink transition-colors">Browse Jobs</Link></li>
            <li><Link to="/jobs/remote" className="hover:text-ink transition-colors">Remote Jobs</Link></li>
            <li><Link to="/jobs/technical" className="hover:text-ink transition-colors">Technical Jobs</Link></li>
            <li><Link to="/jobs/non-technical" className="hover:text-ink transition-colors">Non-Technical Jobs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-ink">For Recruiters</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/recruiter/post-job" className="hover:text-ink transition-colors">Post a Job</Link></li>
            <li><Link to="/recruiter/dashboard" className="hover:text-ink transition-colors">Recruiter Dashboard</Link></li>
            <li><Link to="/auth/register" className="hover:text-ink transition-colors">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm text-ink">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/jobs" className="hover:text-ink transition-colors">Top Companies</Link></li>
            <li><Link to="/auth/login" className="hover:text-ink transition-colors">Sign In</Link></li>
            <li><Link to="/auth/register" className="hover:text-ink transition-colors">Register</Link></li>
            <li><Link to="/admin/dashboard" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">Admin Portal</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Job Workplace (Appletree Infotech). All rights reserved.</p>
        <div className="flex gap-3 text-muted">
          <a href="#" aria-label="Twitter" className="hover:text-ink transition-colors"><FaXTwitter className="h-4 w-4" /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-ink transition-colors"><FaLinkedin className="h-4 w-4" /></a>
          <a href="#" aria-label="GitHub" className="hover:text-ink transition-colors"><FaGithub className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
