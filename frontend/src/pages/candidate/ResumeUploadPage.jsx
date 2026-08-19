import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh,
  FaFileArrowUp, FaCircleCheck, FaRobot, FaBullseye, FaArrowRotateRight,
  FaChevronDown, FaChevronUp, FaClipboard, FaDownload, FaTriangleExclamation, FaGlobe,
  FaFilePdf, FaSpinner,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { candidateService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/format';
import api from '../../services/api';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',          icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',        icon: FaUser },
  { to: '/candidate/portfolio',    label: 'AI Portfolio Studio', icon: FaWandMagicSparkles },
  { to: '/candidate/recommended',  label: 'Recommended Jobs',  icon: FaBriefcase },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',        icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications',   icon: FaBriefcase },
  { to: '/candidate/resume',       label: 'Resume Hub',        icon: FaFileArrowUp },
];

const TABS = [
  { id: 'upload',  label: 'Upload',        icon: FaFileArrowUp },
  { id: 'builder', label: 'AI Builder',    icon: FaRobot },
  { id: 'ats',     label: 'ATS Optimizer', icon: FaBullseye },
];

const calculateLocalScore = (u) => {
  if (!u) return 0;
  let s = 0;
  if (u.resume?.url) s += 30;
  if (u.skills?.length >= 5) s += 20;
  else if (u.skills?.length) s += 10;
  if (u.headline) s += 10;
  if (u.bio && u.bio.length >= 100) s += 10;
  if (u.experience?.length) s += 15;
  if (u.education?.length) s += 5;
  if (u.certifications?.length) s += 5;
  if (u.avatar) s += 5;
  return Math.min(s, 100);
};

export default function ResumeUploadPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab]           = useState('upload');
  const [score, setScore]       = useState(() => calculateLocalScore(user));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setScore(calculateLocalScore(user));
  }, [user]);

  const load = useCallback(async () => {
    try {
      const { data } = await candidateService.resumeScore();
      if (typeof data?.score === 'number') setScore(data.score);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','doc','docx'].includes(ext)) { toast.error('Only PDF, DOC, DOCX allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setUploading(true);
    try {
      await candidateService.uploadResume(file);
      toast.success('Resume uploaded');
      await load();
      await refreshUser();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const scoreColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-accent' : 'bg-orange-400';
  const scoreLabel = score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-yellow-700' : 'text-orange-700';

  return (
    <DashboardLayout title="Resume Hub" subtitle="Upload, build, and optimize your resume with AI" navItems={navItems}>
      {/* Score bar */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaFileArrowUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-ink">Profile Resume Score</span>
          </div>
          <span className={`text-2xl font-extrabold ${scoreLabel}`}>{score}<span className="text-sm font-normal text-muted">/100</span></span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${scoreColor}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs text-muted mt-1.5">{score < 40 ? 'Complete your profile to improve your score' : score < 70 ? 'Good start — add more details to stand out' : 'Great profile — you\'re ready to apply!'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'upload'  && <UploadTab user={user} uploading={uploading} upload={upload} score={score} />}
      {tab === 'builder' && <BuilderTab />}
      {tab === 'ats'     && <ATSTab />}
    </DashboardLayout>
  );
}

// ── Upload Tab ────────────────────────────────────────────────────────────────
function UploadTab({ user, uploading, upload, score }) {
  return (
    <div className="card p-6 space-y-5">
      {user?.resume?.url ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <FaCircleCheck className="h-6 w-6 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.resume.originalName}</p>
            <p className="text-xs text-muted">Uploaded {formatDateTime(user.resume.uploadedAt)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href={user.resume.url} target="_blank" rel="noreferrer" className="btn-outline !py-1.5 !text-xs">View</a>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-line rounded-xl p-10 text-center">
          <FaFileArrowUp className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-ink mb-1">No resume uploaded yet</p>
          <p className="text-xs text-muted">Upload a PDF, DOC, or DOCX file</p>
        </div>
      )}
      <label className="btn-primary cursor-pointer w-full !py-3.5 justify-center">
        <FaFileArrowUp className="h-4 w-4" />
        {uploading ? 'Uploading…' : user?.resume?.url ? 'Replace Resume' : 'Upload Resume'}
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={upload} disabled={uploading} />
      </label>
      <p className="text-xs text-muted text-center">PDF, DOC, DOCX • Max 5MB</p>

      {/* AI Analyzer CTA */}
      <Link to="/candidate/resume/analyze" className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 rounded-xl hover:border-primary-300 transition-colors group">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shrink-0">
          <FaRobot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">AI Resume Analyzer</p>
          <p className="text-xs text-muted">ATS score · Grammar · Missing skills · Keyword gaps</p>
        </div>
        <FaCircleCheck className="h-4 w-4 text-primary group-hover:text-primary-700 transition-colors" />
      </Link>
      <div className="pt-2 border-t border-line">
        <p className="text-sm font-semibold mb-3">How to improve your score</p>
        {[
          ['Upload a resume', 30, !!user?.resume?.url],
          ['Add 5+ skills', 20, (user?.skills?.length || 0) >= 5],
          ['Add work experience', 15, (user?.experience?.length || 0) > 0],
          ['Add headline & bio', 20, !!(user?.headline && user?.bio)],
          ['Add education', 5, (user?.education?.length || 0) > 0],
          ['Add certifications', 5, (user?.certifications?.length || 0) > 0],
          ['Add avatar', 5, !!user?.avatar],
        ].map(([label, pts, done]) => (
          <div key={label} className={`flex items-center justify-between py-1.5 text-sm ${done ? 'text-emerald-700' : 'text-muted'}`}>
            <span className="flex items-center gap-2">
              <FaCircleCheck className={`h-3.5 w-3.5 ${done ? 'text-emerald-500' : 'text-slate-300'}`} />
              {label}
            </span>
            <span className={`text-xs font-medium ${done ? 'line-through text-muted' : 'text-ink'}`}>+{pts} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Builder Tab ────────────────────────────────────────────────────────────
function BuilderTab() {
  const [loading,     setLoading]     = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [resume,      setResume]      = useState(null);
  const [expanded,    setExpanded]    = useState({});
  const [pdfTemplate, setPdfTemplate] = useState('classic');

  const TEMPLATES = [
    { id: 'classic', label: 'Classic',       desc: 'Clean single-column, max ATS score' },
    { id: 'modern',  label: 'Modern Sidebar', desc: 'Two-column, dark sidebar design'   },
  ];

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/voice/resume/build');
      setResume(data.resume);
      setExpanded({ summary: true, experience: true, skills: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate resume. Try again.');
    } finally { setLoading(false); }
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await api.post(
        '/voice/resume/pdf',
        { resume: resume || undefined, template: pdfTemplate },
        { responseType: 'blob', timeout: 120000 }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      // Get filename from Content-Disposition header if present
      const cd   = response.headers['content-disposition'] || '';
      const match = cd.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : 'ats-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'PDF generation failed. Try again.');
    } finally { setPdfLoading(false); }
  };

  const copy  = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };
  const toggle = (key)  => setExpanded(p => ({ ...p, [key]: !p[key] }));

  if (!resume) return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card p-6 text-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto">
          <FaRobot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-ink">AI Resume Builder</h3>
          <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
            Generates a polished, ATS-friendly resume from your profile. Pick a template, then click Generate.
          </p>
        </div>
      </div>

      {/* Template picker — shown BEFORE generating */}
      <div className="card p-5 space-y-3">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <FaFilePdf className="h-4 w-4 text-primary-500" /> Choose Resume Template
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setPdfTemplate(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                pdfTemplate === t.id
                  ? 'border-primary-500 bg-primary-50/60 shadow-sm'
                  : 'border-line hover:border-primary-300 hover:bg-slate-50'
              }`}>
              {/* Mini template preview */}
              <div className={`h-12 w-10 rounded shrink-0 flex flex-col overflow-hidden border ${
                pdfTemplate === t.id ? 'border-primary-300' : 'border-slate-200'
              }`}>
                {t.id === 'classic' ? (
                  <div className="flex flex-col gap-0.5 p-1 bg-white h-full">
                    <div className="h-1.5 bg-slate-700 rounded-sm w-3/4 mx-auto" />
                    <div className="h-0.5 bg-slate-300 rounded w-full" />
                    <div className="h-0.5 bg-slate-200 rounded w-full mt-0.5" />
                    <div className="h-0.5 bg-slate-200 rounded w-5/6" />
                    <div className="h-0.5 bg-slate-700 rounded w-full mt-1" />
                    <div className="h-0.5 bg-slate-200 rounded w-full mt-0.5" />
                    <div className="h-0.5 bg-slate-200 rounded w-4/5" />
                  </div>
                ) : (
                  <div className="flex h-full">
                    <div className="w-1/3 bg-slate-700 h-full flex flex-col gap-0.5 p-0.5">
                      <div className="h-2 w-2 rounded-full bg-slate-400 mx-auto mt-0.5" />
                      <div className="h-0.5 bg-slate-500 rounded w-full mt-1" />
                      <div className="h-0.5 bg-slate-600 rounded w-3/4 mx-auto" />
                      <div className="h-0.5 bg-slate-600 rounded w-3/4 mx-auto" />
                    </div>
                    <div className="w-2/3 bg-white flex flex-col gap-0.5 p-0.5">
                      <div className="h-1 bg-slate-700 rounded w-3/4" />
                      <div className="h-0.5 bg-slate-300 rounded w-full" />
                      <div className="h-0.5 bg-slate-200 rounded w-5/6" />
                      <div className="h-0.5 bg-cyan-400 rounded w-full mt-0.5" />
                      <div className="h-0.5 bg-slate-200 rounded w-full" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold flex items-center gap-1.5 ${pdfTemplate === t.id ? 'text-primary-700' : 'text-ink'}`}>
                  {pdfTemplate === t.id && <FaCircleCheck className="h-3 w-3 text-primary-600 shrink-0" />}
                  {t.label}
                </p>
                <p className="text-xs text-muted mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={loading}
        className="btn-primary w-full !py-3.5 disabled:opacity-50 gap-2">
        {loading
          ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating your resume…</>
          : <><FaWandMagicSparkles className="h-4 w-4" /> Generate Resume</>}
      </button>
      <p className="text-xs text-muted text-center">Make sure your profile is complete for the best results</p>
    </div>
  );

  const allSkills = [...(resume.skills?.technical||[]), ...(resume.skills?.soft||[]), ...(resume.skills?.tools||[])];

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-ink">AI-Generated Resume</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={generate} disabled={loading}
            className="btn-outline !py-2 !text-xs gap-1.5 disabled:opacity-50">
            {loading
              ? <><span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" /> Regenerating…</>
              : <><FaArrowRotateRight className="h-3 w-3" /> Regenerate</>}
          </button>
          <button onClick={downloadPdf} disabled={pdfLoading}
            className="btn-primary !py-2 !text-xs gap-1.5 disabled:opacity-50">
            {pdfLoading
              ? <><span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating PDF…</>
              : <><FaFilePdf className="h-3 w-3" /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* ATS tip banner */}
      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
        <FaFilePdf className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" />
        <span>
          <strong>ATS-Optimised PDF</strong> — single-column layout, selectable text, standard fonts, keyword-rich content. Ready to upload to any ATS portal.
        </span>
      </div>

      {/* Template picker */}
      <div className="card p-4 space-y-2">
        <p className="text-xs font-bold text-ink flex items-center gap-1.5">
          <FaFilePdf className="h-3 w-3 text-primary-500" /> Choose Template
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setPdfTemplate(t.id)}
              className={`flex flex-col items-start px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                pdfTemplate === t.id
                  ? 'border-primary-500 bg-primary-50/60'
                  : 'border-line hover:border-primary-300 hover:bg-slate-50'
              }`}>
              <span className={`text-xs font-semibold ${pdfTemplate === t.id ? 'text-primary-700' : 'text-ink'}`}>
                {pdfTemplate === t.id ? '✓ ' : ''}{t.label}
              </span>
              <span className="text-[10px] text-muted mt-0.5">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {resume._fallback && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <FaTriangleExclamation className="h-3.5 w-3.5 shrink-0" />
          AI providers unavailable — showing profile-based resume. Add OpenRouter or Qwen API key for AI-enhanced content.
        </div>
      )}

      {/* Resume sections */}
      <ResumeSection title="Professional Summary" expanded={expanded.summary} onToggle={() => toggle('summary')}
        onCopy={() => copy(resume.summary)}>
        <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
      </ResumeSection>

      <ResumeSection title={`Skills (${allSkills.length})`} expanded={expanded.skills} onToggle={() => toggle('skills')}
        onCopy={() => copy(allSkills.join(', '))}>
        {resume.skills?.technical?.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Technical</p>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.technical.map(s => <span key={s} className="badge badge-primary !text-xs">{s}</span>)}
            </div>
          </div>
        )}
        {resume.skills?.soft?.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Soft Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.soft.map(s => <span key={s} className="badge badge-muted !text-xs">{s}</span>)}
            </div>
          </div>
        )}
        {resume.skills?.tools?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Tools & Platforms</p>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.tools.map(s => <span key={s} className="badge !text-xs !bg-slate-100 !text-slate-700">{s}</span>)}
            </div>
          </div>
        )}
      </ResumeSection>

      <ResumeSection title={`Experience (${resume.experience?.length || 0})`} expanded={expanded.experience}
        onToggle={() => toggle('experience')}>
        <div className="space-y-4">
          {(resume.experience || []).map((e, i) => (
            <div key={i} className="border-l-2 border-primary-200 pl-4">
              <p className="font-semibold text-sm text-ink">{e.role}</p>
              <p className="text-xs text-muted mb-1.5">{e.company} • {e.duration}</p>
              <ul className="space-y-1">
                {(e.bullets || []).map((b, j) => (
                  <li key={j} className="text-xs text-slate-700 flex gap-2">
                    <span className="text-primary-500 mt-0.5 shrink-0">▸</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title={`Education (${resume.education?.length || 0})`} expanded={expanded.education}
        onToggle={() => toggle('education')}>
        <div className="space-y-2">
          {(resume.education || []).map((e, i) => (
            <div key={i}>
              <p className="font-semibold text-sm text-ink">{e.degree}</p>
              <p className="text-xs text-muted">{e.institution}{e.year ? ` • ${e.year}` : ''}{e.highlights ? ` • ${e.highlights}` : ''}</p>
            </div>
          ))}
        </div>
      </ResumeSection>

      {resume.projects?.length > 0 && (
        <ResumeSection title={`Projects (${resume.projects.length})`} expanded={expanded.projects}
          onToggle={() => toggle('projects')}
          onCopy={() => copy(resume.projects.map(p => `${p.name}: ${p.desc}`).join('\n'))}>
          <div className="space-y-3">
            {resume.projects.map((p, i) => (
              <div key={i} className="border-l-2 border-emerald-200 pl-4">
                <p className="font-semibold text-sm text-ink">{p.name}</p>
                {p.tech && <p className="text-xs text-muted mb-1">{p.tech}</p>}
                <p className="text-xs text-slate-700">{p.desc}</p>
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {resume.improvements?.length > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200">
          <p className="text-sm font-bold text-amber-800 mb-2">💡 Improvement Suggestions</p>
          <ul className="space-y-1.5">
            {resume.improvements.map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 flex gap-2"><span className="mt-0.5 shrink-0">•</span>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom download CTA */}
      <div className="pt-2 border-t border-line flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <p className="text-xs text-muted">Ready to apply? Download your resume as a PDF.</p>
          <p className="text-[10px] text-muted mt-0.5">
            Template: <span className="font-semibold text-ink">{TEMPLATES.find(t => t.id === pdfTemplate)?.label}</span>
          </p>
        </div>
        <button onClick={downloadPdf} disabled={pdfLoading}
          className="btn-primary !py-3 !px-6 gap-2 shrink-0 disabled:opacity-50">
          {pdfLoading
            ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating…</>
            : <><FaFilePdf className="h-4 w-4" /> Download PDF</>}
        </button>
      </div>
    </div>
  );
}

// ── ATS Optimizer Tab ─────────────────────────────────────────────────────────
function ATSTab() {
  const [jd, setJd]           = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const analyse = async () => {
    if (jd.trim().length < 20) { toast.error('Paste a full job description first'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/voice/resume/ats', { jobDescription: jd });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally { setLoading(false); }
  };

  const gradeColor = (g) => ({ A:'text-emerald-600 bg-emerald-50 border-emerald-200', B:'text-blue-600 bg-blue-50 border-blue-200', C:'text-yellow-600 bg-yellow-50 border-yellow-200', D:'text-orange-600 bg-orange-50 border-orange-200', F:'text-red-600 bg-red-50 border-red-200' })[g] || '';
  const scoreBar = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  const priorityColor = (p) => ({ high:'text-red-700 bg-red-50 border-red-200', medium:'text-yellow-700 bg-yellow-50 border-yellow-200', low:'text-slate-600 bg-slate-50 border-line' })[p] || '';

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <FaBullseye className="h-4 w-4 text-primary" />
          <p className="font-semibold text-sm text-ink">ATS Score Optimizer</p>
        </div>
        <p className="text-xs text-muted">Paste any job description to see how well your profile matches and get a prioritized action plan.</p>
        <textarea
          value={jd} onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here…&#10;&#10;e.g. We are looking for a Senior React Developer with 4+ years experience in TypeScript, Node.js, AWS..."
          rows={7} maxLength={8000}
          className="input !rounded-xl resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted">{jd.length}/8000</span>
          <button onClick={analyse} disabled={loading || jd.trim().length < 20} className="btn-primary disabled:opacity-40">
            {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Analysing…</> : <><FaBullseye className="h-4 w-4" /> Analyse Match</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Overall score */}
          <div className="card p-5 flex items-center gap-5">
            <div className={`h-20 w-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${gradeColor(result.grade)}`}>
              <span className="text-3xl font-black">{result.grade}</span>
              <span className="text-xs font-semibold">{result.overallScore}%</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink">ATS Match Score: {result.overallScore}/100</p>
              <p className="text-xs text-muted mt-0.5">{result.overallScore >= 80 ? 'Excellent match — you\'re a strong candidate' : result.overallScore >= 60 ? 'Good match — a few improvements will help' : result.overallScore >= 40 ? 'Fair match — significant gaps to address' : 'Low match — major profile improvements needed'}</p>
              {result._fallback && <p className="text-[10px] text-amber-600 mt-1">• Algorithmic score (AI model offline)</p>}
            </div>
          </div>

          {/* Section scores */}
          <div className="card p-4">
            <p className="text-sm font-bold mb-3">Score Breakdown</p>
            <div className="space-y-3">
              {Object.values(result.sections || {}).map((sec) => (
                <div key={sec.label}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted">{sec.label}</span><span className="font-semibold text-ink">{sec.score}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${scoreBar(sec.score)}`} style={{ width: `${sec.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid md:grid-cols-2 gap-3">
            {result.matchedKeywords?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-bold text-emerald-700 mb-2">✓ Matched Keywords ({result.matchedKeywords.length})</p>
                <div className="flex flex-wrap gap-1.5">{result.matchedKeywords.map((k) => <span key={k} className="badge badge-emerald !text-[10px]">{k}</span>)}</div>
              </div>
            )}
            {result.missingKeywords?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-bold text-red-700 mb-2">✗ Missing Keywords ({result.missingKeywords.length})</p>
                <div className="flex flex-wrap gap-1.5">{result.missingKeywords.map((k) => <span key={k} className="badge !bg-red-50 !text-red-700 !border-red-200 !text-[10px]">{k}</span>)}</div>
              </div>
            )}
          </div>

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-bold mb-3">Action Plan</p>
              <div className="space-y-2">{result.improvements.map((item, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border text-xs ${priorityColor(item.priority)}`}>
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] shrink-0 ${priorityColor(item.priority)}`}>{item.priority}</span>
                  <div><p className="font-semibold">{item.title}</p><p className="mt-0.5 opacity-80">{item.detail}</p></div>
                </div>
              ))}</div>
            </div>
          )}

          {/* Optimized summary */}
          {result.optimizedSummary && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-ink">AI-Optimized Summary for This Job</p>
                <button onClick={() => { navigator.clipboard.writeText(result.optimizedSummary); toast.success('Copied!'); }} className="p-1.5 rounded-lg text-muted hover:bg-slate-100 transition-colors"><FaClipboard className="h-3.5 w-3.5" /></button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-primary-50 border border-primary-100 rounded-xl p-3">{result.optimizedSummary}</p>
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="card p-4 bg-emerald-50 border-emerald-200">
              <p className="text-sm font-bold text-emerald-800 mb-2">✓ Your Strengths for This Role</p>
              <ul className="space-y-1">{result.strengths.map((s, i) => <li key={i} className="text-xs text-emerald-700 flex gap-2"><FaCircleCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />{s}</li>)}</ul>
            </div>
          )}

          <button onClick={() => { setResult(null); setJd(''); }} className="btn-outline w-full"><FaArrowRotateRight className="h-3.5 w-3.5" /> Analyse Another Job</button>
        </div>
      )}
    </div>
  );
}

// ── Shared collapsible section ────────────────────────────────────────────────
function ResumeSection({ title, expanded, onToggle, onCopy, children }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <span className="text-sm font-bold text-ink">{title}</span>
        <div className="flex items-center gap-2">
          {onCopy && <span onClick={(e) => { e.stopPropagation(); onCopy(); }} className="p-1 rounded text-muted hover:text-primary transition-colors"><FaClipboard className="h-3.5 w-3.5" /></span>}
          {expanded ? <FaChevronUp className="h-3.5 w-3.5 text-muted" /> : <FaChevronDown className="h-3.5 w-3.5 text-muted" />}
        </div>
      </button>
      {expanded && <div className="px-4 pb-4 border-t border-line pt-3">{children}</div>}
    </div>
  );
}
