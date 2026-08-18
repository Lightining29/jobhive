import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaWandMagicSparkles,
  FaGlobe,
  FaCopy,
  FaArrowUpRightFromSquare,
  FaShareNodes,
  FaEye,
  FaPenToSquare,
  FaSliders,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
  FaQrcode,
  FaBolt,
  FaPalette,
  FaCheck,
  FaLaptop,
  FaMobileScreen,
  FaUser,
  FaGaugeHigh,
  FaBriefcase,
  FaRegBookmark,
  FaFileArrowUp,
  FaRotate,
  FaFloppyDisk,
  FaPlus,
  FaTrashCan,
} from 'react-icons/fa6';
import { portfolioService, candidateService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { ModernTechTheme } from '../../components/portfolio/ModernTechTheme';
import { ExecutiveTheme } from '../../components/portfolio/ExecutiveTheme';

export const CandidatePortfolioPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'edit' | 'settings'
  const [previewTheme, setPreviewTheme] = useState('modern_tech');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioService.get();
      if (res.data.hasPortfolio && res.data.portfolio) {
        setHasPortfolio(true);
        setPortfolio(res.data.portfolio);
        setPreviewTheme(res.data.portfolio.theme || 'modern_tech');
      } else {
        setHasPortfolio(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await portfolioService.generate();
      setPortfolio(res.data.portfolio);
      setHasPortfolio(true);
      setPreviewTheme(res.data.portfolio.theme || 'modern_tech');
      toast.success('AI Portfolio successfully generated from your profile!');
    } catch (err) {
      toast.error(err.message || 'Portfolio generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      setSaving(true);
      const dataToSave = updatedData || portfolio;
      const res = await portfolioService.update(dataToSave);
      setPortfolio(res.data.portfolio);
      toast.success('Portfolio updated and live!');
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSwitch = (themeKey) => {
    setPreviewTheme(themeKey);
    const updated = { ...portfolio, theme: themeKey };
    setPortfolio(updated);
    handleSave(updated);
  };

  const publicUrl = portfolio?.slug ? `${window.location.origin}/portfolio/${portfolio.slug}` : '';

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public portfolio link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const navItems = [
    { to: '/candidate/dashboard',    label: 'Overview',        icon: FaGaugeHigh },
    { to: '/candidate/profile',      label: 'My Profile',      icon: FaUser },
    { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles, active: true },
    { to: '/candidate/recommended',  label: 'Recommended Jobs',icon: FaBolt },
    { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
    { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
    { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  ];

  return (
    <DashboardLayout title="AI Portfolio Studio" subtitle="Transform your profile into an interactive, live recruiter-ready portfolio in 1 click" navItems={navItems}>
      <div className="space-y-6">

        {/* ── Top Action Header Bar ── */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#040816] border border-slate-200 dark:border-[#00f0ff]/50 dark:shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white dark:neon-text-cyan flex items-center gap-2">
                1-Click AI Portfolio Builder
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium mt-1">
              {hasPortfolio
                ? `Published at ${publicUrl || '/portfolio/' + portfolio?.slug} • ${portfolio?.views || 0} views`
                : 'Click "Create My Portfolio" to analyze your skills, experience, and projects.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all cursor-pointer disabled:opacity-50"
            >
              <FaWandMagicSparkles className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'AI Analyzing Profile...' : hasPortfolio ? 'Regenerate with AI' : 'Create My Portfolio'}
            </button>

            {hasPortfolio && (
              <>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 transition-all"
                  title="Copy public link"
                >
                  {copied ? <FaCheck className="h-3.5 w-3.5 text-emerald-400" /> : <FaCopy className="h-3.5 w-3.5 text-cyan-400" />}
                  <span>{copied ? 'Copied' : 'Share Link'}</span>
                </button>

                <a
                  href={`/portfolio/${portfolio.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/40 hover:scale-105 transition-all shadow-sm"
                >
                  <FaArrowUpRightFromSquare className="h-3 w-3" /> Live
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Studio Navigation Tabs & Theme Switcher ── */}
        {hasPortfolio && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30">
            {/* View Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/50 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FaEye className="h-3.5 w-3.5" /> Live Preview
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'edit'
                    ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FaPenToSquare className="h-3.5 w-3.5" /> Edit Sections
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FaSliders className="h-3.5 w-3.5" /> URL & SEO
              </button>
            </div>

            {/* Theme Selector Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FaPalette className="h-3 w-3 text-cyan-400" /> Theme:
              </span>
              <button
                onClick={() => handleThemeSwitch('modern_tech')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewTheme === 'modern_tech'
                    ? 'bg-[#00f0ff] text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.7)]'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Theme 1: Modern Tech
              </button>
              <button
                onClick={() => handleThemeSwitch('executive')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewTheme === 'executive'
                    ? 'bg-[#00f0ff] text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.7)]'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Theme 2: Executive
              </button>
            </div>
          </div>
        )}

        {/* ── Content View Area ── */}
        {!hasPortfolio && !loading && (
          <div className="p-12 sm:p-16 rounded-[32px] bg-white dark:bg-[#040816] border-2 border-dashed border-slate-300 dark:border-[#00f0ff]/40 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,240,255,0.7)]">
              <FaWandMagicSparkles className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Ready to create your portfolio?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">
                JobHive AI will instantly read your verified skills, job history, and projects to generate a beautiful, responsive portfolio website.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:scale-105 shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
            >
              <FaWandMagicSparkles className="h-4 w-4" />
              {generating ? 'Analyzing profile & generating...' : 'Create My Portfolio Now'}
            </button>
          </div>
        )}

        {/* ── TAB 1: LIVE PREVIEW ── */}
        {hasPortfolio && activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>Rendering Mode:</span>
                <span className="text-cyan-400 font-black uppercase">{previewTheme === 'modern_tech' ? 'Theme 1 (Modern Tech SaaS)' : 'Theme 2 (Professional Executive)'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded text-xs ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 text-cyan-400 shadow-xs' : 'text-slate-500'}`}
                  title="Desktop viewport"
                >
                  <FaLaptop className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded text-xs ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 text-cyan-400 shadow-xs' : 'text-slate-500'}`}
                  title="Mobile viewport"
                >
                  <FaMobileScreen className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={`mx-auto rounded-[28px] overflow-hidden border-2 border-slate-300 dark:border-[#00f0ff]/50 shadow-2xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-[420px]' : 'w-full'
            }`}>
              {previewTheme === 'modern_tech' ? (
                <ModernTechTheme portfolio={portfolio} isPreview={true} />
              ) : (
                <ExecutiveTheme portfolio={portfolio} isPreview={true} />
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: EDIT SECTIONS ── */}
        {hasPortfolio && activeTab === 'edit' && (
          <div className="space-y-6">
            {/* Hero Section Form */}
            <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#040816] border border-slate-200 dark:border-cyan-500/30 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Hero & Header Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-300">Full Name</label>
                  <input
                    value={portfolio.hero?.name || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, hero: { ...portfolio.hero, name: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-300">Professional Title / Role</label>
                  <input
                    value={portfolio.hero?.title || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, hero: { ...portfolio.hero, title: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-300">Hero Tagline / Value Proposition</label>
                  <input
                    value={portfolio.hero?.tagline || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, hero: { ...portfolio.hero, tagline: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* About Me Form */}
            <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#040816] border border-slate-200 dark:border-cyan-500/30 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> About Me & Professional Summary
              </h3>
              <textarea
                rows={4}
                value={portfolio.about?.summary || ''}
                onChange={(e) => setPortfolio({ ...portfolio, about: { ...portfolio.about, summary: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm"
              />
            </div>

            {/* Save Controls */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_20px_rgba(0,240,255,0.7)] hover:scale-105 transition-all cursor-pointer"
              >
                <FaFloppyDisk className="h-4 w-4" />
                {saving ? 'Saving Changes...' : 'Save & Publish Live'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: SETTINGS & SEO ── */}
        {hasPortfolio && activeTab === 'settings' && (
          <div className="p-6 sm:p-8 rounded-[24px] bg-white dark:bg-[#040816] border border-slate-200 dark:border-cyan-500/30 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaGlobe className="h-4 w-4 text-cyan-400" /> Portfolio URL & Search Optimization (SEO)
            </h3>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300">Custom URL Slug</label>
                <div className="flex items-center mt-1">
                  <span className="px-3 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono border border-r-0 border-slate-300 dark:border-slate-700">
                    jobworkplace.com/portfolio/
                  </span>
                  <input
                    value={portfolio.slug || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, slug: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-r-xl bg-slate-50 dark:bg-[#070e24] border border-slate-300 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300">SEO Page Title</label>
                <input
                  value={portfolio.seo?.title || ''}
                  onChange={(e) => setPortfolio({ ...portfolio, seo: { ...portfolio.seo, title: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-300 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300">Meta Description</label>
                <textarea
                  rows={3}
                  value={portfolio.seo?.metaDescription || ''}
                  onChange={(e) => setPortfolio({ ...portfolio, seo: { ...portfolio.seo, metaDescription: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e24] border border-slate-300 dark:border-cyan-500/40 text-slate-900 dark:text-white text-sm mt-1"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_15px_rgba(0,240,255,0.7)] hover:scale-105 transition-all"
                >
                  <FaCheck className="h-3 w-3" /> Save SEO Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CandidatePortfolioPage;
