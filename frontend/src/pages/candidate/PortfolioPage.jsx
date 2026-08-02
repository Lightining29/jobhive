import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh,
  FaFileArrowUp, FaGlobe, FaCircleCheck, FaTriangleExclamation, FaRocket,
  FaCopy, FaArrowUpRightFromSquare, FaLink, FaPalette, FaCheck,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',        icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',      icon: FaUser },
  { to: '/candidate/recommended',  label: 'Recommended',     icon: FaWandMagicSparkles },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
  { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  { to: '/candidate/deployment',   label: 'Deployments',     icon: FaGlobe },
];

const PROFILE_FIELDS = [
  ['name',        'Full name',       true ],
  ['headline',    'Headline',        false],
  ['bio',         'Bio/Summary',     false],
  ['skills',      '5+ skills',       false],
  ['experience',  'Work experience', false],
  ['education',   'Education',       false],
  ['socialLinks', 'Social links',    false],
];

// ── Theme picker ──────────────────────────────────────────────────────────────
function ThemePicker({ themes, selected, onChange }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <FaPalette className="h-4 w-4 text-primary-500" />
        <p className="font-bold text-sm text-ink">Portfolio Theme</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {themes.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
              selected === t.id
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-line hover:border-primary-300 hover:bg-slate-50'
            }`}>
            {/* colour swatches */}
            <div className="flex gap-1 shrink-0">
              {t.preview.map((c, i) => (
                <span key={i} className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-xs font-medium text-ink flex-1">
              {t.emoji} {t.label}
            </span>
            {selected === t.id && (
              <FaCheck className="h-3 w-3 text-primary-600 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [themes,     setThemes]     = useState([]);
  const [theme,      setTheme]      = useState('dark-orange');

  // Load available themes from backend
  useEffect(() => {
    api.get('/portfolio/themes')
      .then(({ data }) => {
        setThemes(data.themes || []);
      })
      .catch(() => {
        // fallback list if endpoint fails
        setThemes([
          { id: 'dark-orange',   label: 'Dark Orange',   emoji: '🟠', preview: ['#08080a','#ff6a00','#fff'] },
          { id: 'dark-purple',   label: 'Dark Purple',   emoji: '🟣', preview: ['#0a0812','#8b5cf6','#fff'] },
          { id: 'dark-blue',     label: 'Dark Blue',     emoji: '🔵', preview: ['#050d1a','#38bdf8','#fff'] },
          { id: 'dark-green',    label: 'Dark Green',    emoji: '🟢', preview: ['#030b06','#10b981','#fff'] },
          { id: 'light-minimal', label: 'Light Minimal', emoji: '⚪', preview: ['#f8fafc','#6366f1','#0f172a'] },
        ]);
      });
  }, []);

  // Profile completeness
  const checks = PROFILE_FIELDS.map(([field, label, required]) => {
    const val  = user?.[field];
    const done = Array.isArray(val) ? val.length > 0
               : field === 'socialLinks' ? !!(val?.linkedin || val?.github || val?.portfolio)
               : !!val;
    return { field, label, done, required };
  });
  const profileScore = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
  const canGenerate  = !!user?.name;

  const generate = async () => {
    setLoading(true);
    setDeployment(null);
    try {
      const { data } = await api.post('/portfolio/generate', { theme }, { timeout: 120000 });
      setDeployment(data);
      toast.success(data.message || 'Portfolio published!');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Portfolio generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    if (!deployment?.url) return;
    try {
      await navigator.clipboard.writeText(deployment.url);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const openSite = () => {
    if (deployment?.url) window.open(deployment.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DashboardLayout title="Portfolio Generator"
      subtitle="Generate and publish a live portfolio website from your profile"
      navItems={navItems}>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Profile completeness */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-ink">Profile Completeness</p>
              <span className={`text-lg font-extrabold ${
                profileScore >= 70 ? 'text-emerald-600'
                : profileScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                {profileScore}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all duration-700 ${
                profileScore >= 70 ? 'bg-emerald-500'
                : profileScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${profileScore}%` }} />
            </div>
            <div className="space-y-2">
              {checks.map(({ field, label, done, required }) => (
                <div key={field} className={`flex items-center gap-2 text-xs ${
                  done ? 'text-emerald-700' : required ? 'text-red-600' : 'text-muted'}`}>
                  <FaCircleCheck className={`h-3 w-3 ${done ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {label}
                  {required && !done && <span className="text-[10px] text-red-500 font-medium">Required</span>}
                </div>
              ))}
            </div>
            {profileScore < 60 && (
              <Link to="/candidate/profile"
                className="btn-outline w-full !text-xs !py-2 mt-4 justify-center">
                Complete Profile First
              </Link>
            )}
          </div>

          {/* Theme picker */}
          {themes.length > 0 && (
            <ThemePicker themes={themes} selected={theme} onChange={setTheme} />
          )}

          {/* Generate button */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shrink-0">
                <FaGlobe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-ink">Portfolio Generator</p>
                <p className="text-xs text-muted">Builds a site from your profile</p>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              We generate a complete static website — name, skills, projects, experience — and deploy it live with a unique URL you can share anywhere.
            </p>
            <button onClick={generate} disabled={loading || !canGenerate}
              className="btn-primary w-full !py-3.5 disabled:opacity-40">
              {loading
                ? <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                : <><FaRocket className="h-4 w-4" /> Generate &amp; Publish Portfolio</>}
            </button>
            {loading && (
              <p className="text-[11px] text-muted text-center">
                Building your website… this takes up to 60 seconds
              </p>
            )}
            {!canGenerate && (
              <p className="text-xs text-red-600 text-center flex items-center justify-center gap-1">
                <FaTriangleExclamation className="h-3 w-3" /> Add your name to profile first
              </p>
            )}
          </div>

          {/* Success card */}
          {deployment && !loading && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="card p-4 space-y-3 border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-ink">Your site is live!</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <FaLink className="h-3 w-3 text-primary-500 shrink-0" />
                <a href={deployment.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono text-primary-600 truncate hover:underline flex-1">
                  {deployment.url}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={openSite} className="btn-primary !py-2.5 !text-xs gap-1.5">
                  <FaArrowUpRightFromSquare className="h-3 w-3" /> Open Site
                </button>
                <button onClick={copyUrl} className="btn-outline !py-2.5 !text-xs gap-1.5">
                  <FaCopy className="h-3 w-3" /> Copy URL
                </button>
              </div>
              <button onClick={() => navigate('/candidate/deployment')}
                className="btn-emerald w-full !py-2.5 !text-xs">
                Deployment Dashboard
              </button>
            </motion.div>
          )}

          {/* What's included */}
          <div className="card p-4">
            <p className="text-xs font-bold text-ink mb-3">What gets generated</p>
            <ul className="space-y-1.5">
              {[
                ['Hero section with your name & roles',    FaUser],
                ['Professional bio & about section',       FaWandMagicSparkles],
                ['Work experience timeline',               FaBriefcase],
                ['Skills & tech stack grid',               FaCircleCheck],
                ['Projects showcase with modals',          FaGlobe],
                ['Contact section with form',              FaCircleCheck],
                ['5 colour themes to choose from',         FaPalette],
                ['SEO tags, robots.txt & sitemap.xml',     FaCircleCheck],
                ['Unique subdomain — yourname.jobhive.app',FaGlobe],
              ].map(([label, Icon]) => (
                <li key={label} className="flex items-center gap-2 text-xs text-muted">
                  <Icon className="h-3 w-3 text-primary-500 shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:col-span-2">
          {!deployment && !loading && (
            <div className="card h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center mx-auto">
                <FaGlobe className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg text-ink">Your Portfolio Website</h3>
              <p className="text-sm text-muted max-w-sm">
                Pick a theme, click Generate, and we'll build a complete portfolio site and open it live in a new tab.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {['Dark themes', 'Light theme', 'Subdomain URL', 'SEO ready', 'Animations'].map(tag => (
                  <span key={tag} className="badge badge-primary !text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="card h-full min-h-[500px] flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                <FaWandMagicSparkles className="absolute inset-0 m-auto h-6 w-6 text-primary-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-ink">Building your website…</p>
                <p className="text-xs text-muted mt-1">AI is personalising your content — up to 60 seconds</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <span key={i} className="h-2 w-2 rounded-full bg-primary-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {deployment && !loading && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              className="card p-6 space-y-4 min-h-[500px] flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <FaCircleCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg text-ink">Published successfully!</h3>
              <p className="text-sm text-muted max-w-md">
                Your portfolio is live. A new tab should have opened — share the link or manage it from the deployment dashboard.
              </p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-full max-w-sm">
                <FaLink className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                <a href={deployment.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono text-primary-600 truncate flex-1 hover:underline">
                  {deployment.url}
                </a>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={openSite} className="btn-primary gap-2">
                  <FaArrowUpRightFromSquare className="h-4 w-4" /> Open Portfolio
                </button>
                <button onClick={copyUrl} className="btn-outline gap-2">
                  <FaCopy className="h-4 w-4" /> Copy URL
                </button>
                <button onClick={() => navigate('/candidate/deployment')} className="btn-outline gap-2">
                  <FaGaugeHigh className="h-4 w-4" /> Manage Deployment
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
