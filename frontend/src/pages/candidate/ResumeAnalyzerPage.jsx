import { useState, useRef } from 'react';
import {
  FaUser, FaBriefcase, FaRegBookmark, FaWandMagicSparkles, FaGaugeHigh,
  FaFileArrowUp, FaRobot, FaCircleCheck, FaTriangleExclamation,
  FaArrowRight, FaLightbulb, FaBullseye, FaSpellCheck, FaGears,
  FaChevronDown, FaChevronUp, FaClipboard, FaGlobe,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../services/api';

const navItems = [
  { to: '/candidate/dashboard',    label: 'Overview',         icon: FaGaugeHigh },
  { to: '/candidate/profile',      label: 'My Profile',       icon: FaUser },
  { to: '/candidate/recommended',  label: 'Recommended',      icon: FaWandMagicSparkles },
  { to: '/candidate/saved-jobs',   label: 'Saved Jobs',       icon: FaRegBookmark },
  { to: '/candidate/applications', label: 'My Applications',  icon: FaBriefcase },
  { to: '/candidate/resume',       label: 'Resume Hub',       icon: FaFileArrowUp },
];

const ACCEPT = '.pdf,.doc,.docx';
const MAX_MB = 5;

export default function ResumeAnalyzerPage() {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [expanded, setExpanded] = useState({});
  const inputRef = useRef(null);

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf','doc','docx'].includes(ext)) { toast.error('Only PDF, DOC, DOCX files allowed'); return; }
    if (f.size > MAX_MB * 1024 * 1024) { toast.error(`File must be under ${MAX_MB}MB`); return; }
    setFile(f);
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const analyse = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/resume/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setExpanded({ summary: true, grammar: true, skills: true });
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const gradeStyle = (g) => ({
    A: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    B: 'text-blue-700 bg-blue-50 border-blue-200',
    C: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    D: 'text-orange-700 bg-orange-50 border-orange-200',
    F: 'text-red-700 bg-red-50 border-red-200',
  })[g] || 'text-slate-700 bg-slate-50 border-line';

  const barColor = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  const priorityStyle = (p) => ({ high:'bg-red-50 text-red-700 border-red-200', medium:'bg-yellow-50 text-yellow-700 border-yellow-200', low:'bg-slate-50 text-slate-600 border-line' })[p] || '';

  return (
    <DashboardLayout title="AI Resume Analyzer" subtitle="Upload your resume for a full AI-powered analysis" navItems={navItems}>
      {/* Upload card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shrink-0">
            <FaRobot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-ink">AI Resume Analyzer</p>
            <p className="text-xs text-muted">ATS score · Grammar fixes · Missing skills · Weak bullets · Keyword suggestions</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-primary-400 bg-primary-50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-line hover:border-primary-300 hover:bg-slate-50'}`}
        >
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pickFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FaCircleCheck className="h-6 w-6 text-emerald-600" />
              <div className="text-left">
                <p className="font-semibold text-sm text-ink">{file.name}</p>
                <p className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            </div>
          ) : (
            <>
              <FaFileArrowUp className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-ink">Drop your resume here or click to browse</p>
              <p className="text-xs text-muted mt-1">PDF, DOC, DOCX · Max {MAX_MB}MB</p>
            </>
          )}
        </div>

        <button onClick={analyse} disabled={!file || loading} className="btn-primary w-full !py-3.5 mt-4 disabled:opacity-40">
          {loading
            ? <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing…</>
            : <><FaRobot className="h-4 w-4" /> Analyse My Resume</>}
        </button>
        {loading && <p className="text-xs text-muted text-center mt-2">This may take 10-20 seconds…</p>}
      </div>

      {/* Results */}
      <AnimatePresence>
      {result && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-4">
          {result._fallback && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <FaTriangleExclamation className="h-3.5 w-3.5 shrink-0" />
              Algorithmic analysis — add OpenRouter + HuggingFace API keys for AI-powered results.
            </div>
          )}

          {/* Score header */}
          <div className="card p-5 flex items-center gap-5">
            <div className={`h-20 w-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 font-black ${gradeStyle(result.atsGrade)}`}>
              <span className="text-3xl">{result.atsGrade}</span>
              <span className="text-xs font-semibold">{result.atsScore}%</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink">ATS Score: {result.atsScore}/100</p>
              <p className="text-xs text-muted mt-0.5">{result.detectedRole} · {result.detectedIndustry}</p>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{result.overallSummary}</p>
            </div>
          </div>

          {/* Section scores */}
          <Section title="Score Breakdown" icon={FaBullseye} expanded={expanded.scores} onToggle={() => toggle('scores')}>
            <div className="space-y-3">
              {Object.values(result.sections || {}).map((sec) => (
                <div key={sec.feedback}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted font-medium">{Object.keys(result.sections).find(k => result.sections[k] === sec)?.replace(/_/g,' ') || ''}</span><span className="font-semibold text-ink">{sec.score}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1"><div className={`h-full rounded-full transition-all duration-700 ${barColor(sec.score)}`} style={{width:`${sec.score}%`}} /></div>
                  <p className="text-[11px] text-muted">{sec.feedback}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Grammar */}
          {result.grammarIssues?.length > 0 && (
            <Section title={`Grammar Issues (${result.grammarIssues.length})`} icon={FaSpellCheck} expanded={expanded.grammar} onToggle={() => toggle('grammar')}>
              <div className="space-y-3">
                {result.grammarIssues.map((g, i) => (
                  <div key={i} className="border border-line rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-red-700 line-through">{g.original}</p>
                    <p className="text-xs text-emerald-700 font-medium">✓ {g.fixed}</p>
                    <p className="text-[11px] text-muted">{g.issue}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Weak bullets */}
          {result.weakBullets?.length > 0 && (
            <Section title={`Weak Bullet Points (${result.weakBullets.length})`} icon={FaLightbulb} expanded={expanded.bullets} onToggle={() => toggle('bullets')}>
              <div className="space-y-3">
                {result.weakBullets.map((b, i) => (
                  <div key={i} className="border border-line rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-slate-500">Before: <span className="text-slate-700">{b.original}</span></p>
                    <p className="text-xs text-emerald-700 font-medium">After: {b.improved}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Missing skills + keywords */}
          <div className="grid md:grid-cols-2 gap-4">
            {result.missingSkills?.length > 0 && (
              <Section title={`Missing Skills (${result.missingSkills.length})`} icon={FaGears} expanded={expanded.skills} onToggle={() => toggle('skills')}>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map(s => <span key={s} className="badge !bg-red-50 !text-red-700 !border-red-200 !text-xs">{s}</span>)}
                </div>
              </Section>
            )}
            {result.keywordSuggestions?.length > 0 && (
              <Section title={`Keyword Suggestions (${result.keywordSuggestions.length})`} icon={FaClipboard} expanded={expanded.keywords} onToggle={() => toggle('keywords')}>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordSuggestions.map(k => <span key={k} className="badge badge-primary !text-xs">{k}</span>)}
                </div>
              </Section>
            )}
          </div>

          {/* Industry improvements */}
          {result.industryImprovements?.length > 0 && (
            <Section title="Action Plan" icon={FaArrowRight} expanded={expanded.improvements} onToggle={() => toggle('improvements')}>
              <div className="space-y-2">
                {result.industryImprovements.map((item, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border text-xs ${priorityStyle(item.priority)}`}>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] shrink-0 border ${priorityStyle(item.priority)}`}>{item.priority}</span>
                    <div><p className="font-semibold">{item.title}</p><p className="mt-0.5 opacity-80">{item.detail}</p></div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function Section({ title, icon: Icon, expanded, onToggle, children }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <span className="flex items-center gap-2 text-sm font-bold text-ink">
          {Icon && <Icon className="h-4 w-4 text-primary" />}{title}
        </span>
        {expanded ? <FaChevronUp className="h-3.5 w-3.5 text-muted" /> : <FaChevronDown className="h-3.5 w-3.5 text-muted" />}
      </button>
      {expanded && <div className="px-4 pb-4 border-t border-line pt-3">{children}</div>}
    </div>
  );
}
