import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaGaugeHigh, FaUser, FaWandMagicSparkles, FaRegBookmark, FaBriefcase,
  FaFileArrowUp, FaGlobe, FaCopy, FaCheck, FaTrash, FaRotateLeft,
  FaQrcode, FaArrowUpRightFromSquare, FaToggleOn, FaToggleOff,
  FaCircleNotch, FaRocket, FaXmark, FaClockRotateLeft, FaChartLine,
  FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaCodeBranch,
  FaLink, FaShareNodes, FaEye, FaCalendarDays, FaPalette,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../services/api';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',        icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',      icon: FaUser },
  { to: '/candidate/recommended',  label: 'Recommended',     icon: FaWandMagicSparkles },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',      icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications', icon: FaBriefcase },
  { to: '/candidate/resume',       label: 'Resume Hub',      icon: FaFileArrowUp },
  { to: '/candidate/portfolio',    label: 'AI Portfolio',    icon: FaGlobe },
];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, live }) {
  const map = {
    live:     { label: 'Live',     cls: 'bg-emerald-100 text-emerald-700', icon: FaCircleCheck },
    offline:  { label: 'Offline',  cls: 'bg-slate-100 text-slate-500',     icon: FaCircleXmark },
    building: { label: 'Building', cls: 'bg-yellow-100 text-yellow-700',   icon: FaCircleNotch },
    failed:   { label: 'Failed',   cls: 'bg-red-100 text-red-600',         icon: FaTriangleExclamation },
  };
  const key = live ? 'live' : (status === 'live' ? 'offline' : status);
  const { label, cls, icon: Icon } = map[key] || map.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon className={`h-3 w-3 ${key === 'building' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text, size = 'md' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const sz = size === 'sm' ? 'p-1.5' : 'p-2';
  return (
    <button onClick={copy} title="Copy"
      className={`${sz} rounded-lg text-muted hover:bg-accent/10 hover:text-ink transition-colors`}>
      {copied
        ? <FaCheck className="h-3 w-3 text-emerald-600" />
        : <FaCopy className="h-3 w-3" />}
    </button>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({ qrUrl, liveUrl, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 w-full max-w-xs text-center space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink text-sm">Scan to Visit Portfolio</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-slate-100">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center p-3 bg-white rounded-2xl border border-line">
          <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-xl" />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2 text-xs">
          <FaLink className="h-3 w-3 text-primary-500 shrink-0" />
          <span className="text-primary-600 truncate flex-1">{liveUrl}</span>
          <CopyButton text={liveUrl} size="sm" />
        </div>
        <a href={qrUrl} download="portfolio-qr.png"
          className="btn-primary w-full !py-2.5 !text-xs justify-center gap-2">
          Download QR
        </a>
      </motion.div>
    </motion.div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 w-full max-w-sm space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <FaTriangleExclamation className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-ink leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline !py-2 !text-xs">Cancel</button>
          <button onClick={onConfirm}
            className="!py-2 !text-xs px-4 rounded-full bg-red-500 text-white hover:bg-red-600 font-semibold transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── URL display bar ───────────────────────────────────────────────────────────
function LiveUrlBar({ url }) {
  const isSubdomain = url && !url.includes('/p/');
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-line rounded-xl px-3 py-2.5">
      <FaGlobe className={`h-3.5 w-3.5 shrink-0 ${isSubdomain ? 'text-emerald-500' : 'text-primary-500'}`} />
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="text-xs text-primary-600 hover:underline flex-1 truncate font-mono">
        {url}
      </a>
      <CopyButton text={url} size="sm" />
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="p-1.5 rounded-lg text-muted hover:bg-accent/10 hover:text-ink transition-colors" title="Open">
        <FaArrowUpRightFromSquare className="h-3 w-3" />
      </a>
    </div>
  );
}

// ── Share modal ───────────────────────────────────────────────────────────────
function ShareModal({ liveUrl, name, onClose }) {
  const encoded = encodeURIComponent(liveUrl);
  const text    = encodeURIComponent(`Check out ${name}'s portfolio!`);
  const links   = [
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, color: 'bg-blue-600' },
    { label: 'Twitter',  href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,    color: 'bg-sky-500'  },
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${encoded}`,                         color: 'bg-green-500'},
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 w-full max-w-sm space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink text-sm">Share Portfolio</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-slate-100">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
        <LiveUrlBar url={liveUrl} />
        <div className="flex gap-2">
          {links.map(({ label, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className={`flex-1 ${color} text-white text-xs font-semibold py-2 rounded-xl text-center hover:opacity-90 transition-opacity`}>
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DeploymentPage() {
  const [deployments, setDeployments] = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [liveUrl,     setLiveUrl]     = useState('');
  const [loading,     setLoading]     = useState(true);
  const [publishing,  setPublishing]  = useState(false);
  const [togglingId,  setTogglingId]  = useState(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [qrData,      setQrData]      = useState(null);
  const [shareData,   setShareData]   = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId,   setConfirmId]   = useState(null);
  const [themes,      setThemes]      = useState([]);
  const [theme,       setTheme]       = useState('dark-orange');
  const [showThemes,  setShowThemes]  = useState(false);

  const fetchSingle = async (id) => {
    try {
      const { data } = await api.get(`/deployments/${id}`);
      setSelected(data.deployment);
      setLiveUrl(data.liveUrl || '');
      // Sync theme picker with the deployed theme
      if (data.deployment?.theme) setTheme(data.deployment.theme);
    } catch { /* ignore */ }
  };

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    try {
      const [depsRes, themesRes] = await Promise.allSettled([
        api.get('/deployments'),
        api.get('/portfolio/themes'),
      ]);
      if (depsRes.status === 'fulfilled') {
        const deps = depsRes.value.data.deployments || [];
        setDeployments(deps);
        if (deps.length > 0) fetchSingle(deps[0]._id);
      }
      if (themesRes.status === 'fulfilled') {
        setThemes(themesRes.value.data.themes || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load deployments');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchDeployments(); }, [fetchDeployments]);

  // ── Publish / Republish ────────────────────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { data } = await api.post('/deployments/publish', { theme }, { timeout: 120000 });
      toast.success('Portfolio published!');
      setSelected(data.deployment);
      setLiveUrl(data.liveUrl || '');
      setShowThemes(false);
      await fetchDeployments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  // ── Toggle live/offline ────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const { data } = await api.post(`/deployments/${id}/toggle`);
      toast.success(data.message);
      if (selected?._id === id) { setSelected(data.deployment); setLiveUrl(data.liveUrl || ''); }
      setDeployments(prev => prev.map(d => d._id === id ? data.deployment : d));
    } catch (err) {
      toast.error(err.message || 'Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Rollback ───────────────────────────────────────────────────────────────
  const handleRollback = async (id, version) => {
    setRollingBack(true);
    try {
      const { data } = await api.post(`/deployments/${id}/rollback?version=${version}`);
      toast.success(data.message || `Rolled back to v${version}`);
      setSelected(data.deployment);
      setLiveUrl(data.liveUrl || '');
      await fetchDeployments();
    } catch (err) {
      toast.error(err.message || 'Rollback failed');
    } finally {
      setRollingBack(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    setShowConfirm(false);
    try {
      await api.delete(`/deployments/${confirmId}`);
      toast.success('Deployment deleted');
      setDeployments(prev => prev.filter(d => d._id !== confirmId));
      if (selected?._id === confirmId) { setSelected(null); setLiveUrl(''); }
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  // ── Change theme (no republish) ───────────────────────────────────────────
  const handleThemeChange = async (id, newTheme) => {
    try {
      const { data } = await api.post(`/deployments/${id}/theme`, { theme: newTheme });
      toast.success(data.message || 'Theme updated!');
      setTheme(newTheme);
      setSelected(prev => prev ? { ...prev, theme: newTheme } : prev);
      setDeployments(prev => prev.map(d => d._id === id ? { ...d, theme: newTheme } : d));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Theme change failed');
    }
  };

  // ── QR Code ────────────────────────────────────────────────────────────────
  const handleQR = async (id) => {
    try {
      const { data } = await api.get(`/deployments/${id}/qr`);
      setQrData({ qrUrl: data.qrUrl, liveUrl: data.liveUrl });
    } catch (err) {
      toast.error(err.message || 'Failed to load QR');
    }
  };

  const active = selected || deployments[0] || null;
  const hasDeployment = deployments.length > 0;

  return (
    <DashboardLayout title="Portfolio Deployment"
      subtitle="Publish and manage your live portfolio site" navItems={navItems}>

      <AnimatePresence>
        {qrData    && <QRModal    {...qrData}    onClose={() => setQrData(null)} />}
        {shareData && <ShareModal {...shareData} onClose={() => setShareData(null)} />}
        {showConfirm && (
          <ConfirmModal
            message="This will permanently delete the deployment and all version history from disk. This cannot be undone."
            onConfirm={handleDelete}
            onCancel={() => { setShowConfirm(false); setConfirmId(null); }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-5">

        {/* ── Publish card ── */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shrink-0">
                <FaRocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-ink text-base">
                  {hasDeployment ? 'Republish Portfolio' : 'Publish Portfolio'}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {hasDeployment
                    ? 'Regenerate from your latest profile — creates a new version'
                    : 'Deploy your AI-generated portfolio live with a unique URL'}
                </p>
              </div>
            </div>
            <button onClick={handlePublish} disabled={publishing}
              className="btn-primary !py-2.5 !px-6 gap-2 shrink-0 disabled:opacity-50">
              {publishing
                ? <><FaCircleNotch className="h-4 w-4 animate-spin" /> Publishing…</>
                : <><FaRocket className="h-4 w-4" /> {hasDeployment ? 'Republish' : 'Publish Now'}</>}
            </button>
          </div>
          {publishing && (
            <div className="mt-3 rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 text-xs text-violet-700 flex items-center gap-2">
              <FaCircleNotch className="h-3.5 w-3.5 animate-spin shrink-0" />
              Building your site with AI… this takes up to 60 seconds. Please wait.
            </div>
          )}

          {/* Theme picker — collapsible */}
          {!publishing && themes.length > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <button onClick={() => setShowThemes(v => !v)}
                className="flex items-center gap-2 text-xs text-muted hover:text-ink transition-colors w-full">
                <FaPalette className="h-3.5 w-3.5 text-primary-500" />
                <span>
                  Theme: <strong className="text-ink">
                    {themes.find(t => t.id === theme)?.label || theme}
                  </strong>
                </span>
                <span className="ml-auto">{showThemes ? '▲' : '▼'}</span>
              </button>
              {showThemes && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs transition-all ${
                        theme === t.id
                          ? 'border-primary-500 bg-primary-50/50 font-semibold text-ink'
                          : 'border-line hover:border-primary-300 text-muted hover:text-ink'
                      }`}>
                      <div className="flex gap-0.5">
                        {t.preview.map((c, i) => (
                          <span key={i} className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="truncate">{t.emoji} {t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="card p-12 flex flex-col items-center gap-3 text-muted">
            <FaCircleNotch className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm">Loading deployments…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !hasDeployment && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-orange-500 mx-auto flex items-center justify-center">
              <FaGlobe className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-ink">No deployments yet</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Click <strong>Publish Now</strong> above to generate your AI portfolio and get a live URL.
            </p>
          </motion.div>
        )}

        {/* ── Active deployment ── */}
        {!loading && active && (
          <motion.div key={active._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-5">

            {/* ── Left: main controls ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Status + URL card */}
              <div className="card p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink text-base">{active.meta?.name || 'My Portfolio'}</p>
                    <p className="text-xs text-muted">{active.meta?.title || ''}</p>
                  </div>
                  <StatusBadge status={active.status} live={active.live} />
                </div>

                {/* Live URL */}
                {liveUrl && <LiveUrlBar url={liveUrl} />}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggle(active._id)}
                    disabled={togglingId === active._id}
                    className="btn-outline !py-2 !text-xs gap-1.5 disabled:opacity-50">
                    {togglingId === active._id
                      ? <FaCircleNotch className="h-3 w-3 animate-spin" />
                      : active.live
                        ? <FaToggleOn className="h-3.5 w-3.5 text-emerald-600" />
                        : <FaToggleOff className="h-3.5 w-3.5 text-slate-400" />}
                    {active.live ? 'Take Offline' : 'Go Live'}
                  </button>

                  <button onClick={() => handleQR(active._id)}
                    className="btn-outline !py-2 !text-xs gap-1.5">
                    <FaQrcode className="h-3 w-3" /> QR Code
                  </button>

                  {liveUrl && (
                    <button
                      onClick={() => setShareData({ liveUrl, name: active.meta?.name || 'Portfolio' })}
                      className="btn-outline !py-2 !text-xs gap-1.5">
                      <FaShareNodes className="h-3 w-3" /> Share
                    </button>
                  )}

                  <button
                    onClick={() => { setConfirmId(active._id); setShowConfirm(true); }}
                    disabled={deletingId === active._id}
                    className="btn-outline !py-2 !text-xs gap-1.5 !text-red-600 !border-red-200 hover:!bg-red-50 disabled:opacity-50 ml-auto">
                    {deletingId === active._id
                      ? <FaCircleNotch className="h-3 w-3 animate-spin" />
                      : <FaTrash className="h-3 w-3" />}
                    Delete
                  </button>
                </div>
              </div>

              {/* Version history */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaClockRotateLeft className="h-4 w-4 text-primary-500" />
                  <p className="font-bold text-sm text-ink">Deployment History</p>
                  <span className="ml-auto text-xs text-muted">Current: v{active.version}</span>
                </div>

                {(!active.history || active.history.length === 0) ? (
                  <p className="text-xs text-muted">No history available</p>
                ) : (
                  <div className="space-y-2">
                    {[...active.history]
                      .sort((a, b) => b.version - a.version)
                      .map(entry => {
                        const isCurrent = entry.version === active.version;
                        return (
                          <div key={entry.version}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50 border border-emerald-100'
                                : 'bg-slate-50 hover:bg-slate-100'
                            }`}>
                            <div className="flex items-center gap-2">
                              <FaCodeBranch className={`h-3 w-3 ${isCurrent ? 'text-emerald-600' : 'text-muted'}`} />
                              <span className={`font-semibold ${isCurrent ? 'text-emerald-700' : 'text-ink'}`}>
                                v{entry.version}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                  current
                                </span>
                              )}
                            </div>
                            <span className="text-muted flex items-center gap-1">
                              <FaCalendarDays className="h-2.5 w-2.5" />
                              {entry.deployedAt
                                ? new Date(entry.deployedAt).toLocaleDateString(undefined, {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })
                                : '—'}
                            </span>
                            {!isCurrent && (
                              <button
                                onClick={() => handleRollback(active._id, entry.version)}
                                disabled={rollingBack}
                                className="flex items-center gap-1 text-primary-600 hover:text-primary-800 disabled:opacity-50 font-medium shrink-0">
                                {rollingBack
                                  ? <FaCircleNotch className="h-3 w-3 animate-spin" />
                                  : <FaRotateLeft className="h-3 w-3" />}
                                Rollback
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: analytics + details ── */}
            <div className="space-y-4">

              {/* Analytics */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine className="h-4 w-4 text-primary-500" />
                  <p className="font-bold text-sm text-ink">Analytics</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <FaEye className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                    <p className="text-2xl font-extrabold text-ink">{active.analytics?.views ?? 0}</p>
                    <p className="text-[10px] text-muted mt-0.5">Total Views</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <FaCodeBranch className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                    <p className="text-2xl font-extrabold text-ink">v{active.version}</p>
                    <p className="text-[10px] text-muted mt-0.5">Current Version</p>
                  </div>
                </div>
                {active.analytics?.lastViewed && (
                  <p className="text-[11px] text-muted">
                    Last viewed:{' '}
                    {new Date(active.analytics.lastViewed).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="card p-5">
                <p className="font-bold text-sm text-ink mb-3">Details</p>
                <div className="space-y-2.5">
                  {[
                    ['Slug',    active.slug],
                    ['Theme',   themes.find(t => t.id === active.theme)?.label || active.theme || 'Dark Orange'],
                    ['Status',  active.status],
                    ['Created', active.createdAt ? new Date(active.createdAt).toLocaleDateString() : '—'],
                    ['Updated', active.updatedAt ? new Date(active.updatedAt).toLocaleDateString() : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-muted">{label}</span>
                      <span className="font-medium text-ink truncate max-w-[150px]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme switcher — instant re-apply without republish */}
              {themes.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FaPalette className="h-4 w-4 text-primary-500" />
                    <p className="font-bold text-sm text-ink">Change Theme</p>
                    <span className="ml-auto text-[10px] text-muted">No republish needed</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {themes.map(t => {
                      const isCurrent = (active.theme || 'dark-orange') === t.id;
                      return (
                        <button key={t.id}
                          onClick={() => !isCurrent && handleThemeChange(active._id, t.id)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-xs transition-all ${
                            isCurrent
                              ? 'border-primary-500 bg-primary-50/50 font-semibold cursor-default'
                              : 'border-line hover:border-primary-300 hover:bg-slate-50 text-muted hover:text-ink cursor-pointer'
                          }`}>
                          <div className="flex gap-1 shrink-0">
                            {t.preview.map((c, i) => (
                              <span key={i} className="h-3.5 w-3.5 rounded-full border border-black/10"
                                style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="flex-1 text-left">{t.emoji} {t.label}</span>
                          {isCurrent && (
                            <FaCheck className="h-3 w-3 text-primary-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subdomain info */}
              <div className="card p-5 border-dashed border-2 border-primary-200 bg-primary-50/30">
                <p className="font-bold text-xs text-primary-700 mb-2 flex items-center gap-1.5">
                  <FaGlobe className="h-3 w-3" /> Your Subdomain
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Your portfolio is hosted at a unique subdomain. Share it anywhere — it works like a personal website.
                </p>
                {liveUrl && (
                  <div className="mt-3 font-mono text-xs text-primary-700 bg-white border border-primary-200 rounded-lg px-3 py-2 break-all">
                    {liveUrl}
                  </div>
                )}
              </div>

              {/* Multi-deployment selector */}
              {deployments.length > 1 && (
                <div className="card p-5">
                  <p className="font-bold text-sm text-ink mb-3">All Deployments</p>
                  <div className="space-y-1.5">
                    {deployments.map(dep => (
                      <button key={dep._id} onClick={() => fetchSingle(dep._id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                          selected?._id === dep._id
                            ? 'bg-accent/10 text-ink font-semibold'
                            : 'text-muted hover:bg-slate-50 hover:text-ink'
                        }`}>
                        <span className="truncate">{dep.meta?.name || dep.slug}</span>
                        <StatusBadge status={dep.status} live={dep.live} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
