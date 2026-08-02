/**
 * AIFillModal — lets the user describe themselves and auto-fills the profile form.
 *
 * The user speaks or types naturally:
 *   "I'm a React developer with 3 years at TCS, I have a B.Tech from VIT,
 *    I know JavaScript, Node, MongoDB, looking for remote full-time roles."
 *
 * The backend extracts structured JSON → parent merges into react-hook-form.
 */
import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaXmark, FaWandMagicSparkles, FaMicrophone, FaStop,
  FaCircleCheck, FaArrowRight, FaLightbulb,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const EXAMPLE_PROMPTS = [
  "I'm a Full Stack Developer with 3 years of experience at Infosys. I know React, Node.js, MongoDB, and AWS. I have a B.Tech in Computer Science from VIT Vellore (2018–2022). I'm looking for remote senior developer roles paying around 20 LPA.",
  "I'm a Data Scientist at Wipro, 2 years experience. Skills include Python, TensorFlow, SQL, Pandas. Did my M.Tech from IIT Bombay. Looking for hybrid jobs in Bangalore or Hyderabad.",
  "Fresh graduate, B.E. in Electronics from BITS Pilani 2024. Interested in embedded systems and IoT. Skills: C, C++, Python, Arduino. Looking for entry-level roles.",
];

export default function AIFillModal({ isOpen, onClose, onFill }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'preview'
  const [extracted, setExtracted] = useState(null);
  const textareaRef = useRef(null);

  const { isSupported: sttSupported, isListening, transcript, start, stop } =
    useSpeechRecognition({
      continuous: false,   // one-shot dictation — stop after silence
      onFinalTranscript: (t) => {
        setText((prev) => (prev ? `${prev} ${t}` : t));
      },
    });

  const handleExtract = useCallback(async () => {
    const input = text.trim();
    if (!input || input.length < 10) {
      toast.error('Please describe yourself in more detail.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/voice/ai-fill-profile', { text: input });
      setExtracted(data.profile);
      setStep('preview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI extraction failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleApply = () => {
    if (!extracted) return;
    onFill(extracted);
    toast.success('Profile filled by AI — review and save.');
    handleClose();
  };

  const handleClose = () => {
    setText('');
    setExtracted(null);
    setStep('input');
    onClose();
  };

  // Count non-empty extracted fields for preview
  const filledFields = extracted ? Object.entries(extracted).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === 'object') return Object.values(v).some(Boolean);
    return Boolean(v);
  }).length : 0;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lift">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                    <FaWandMagicSparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-ink">AI Profile Fill</h2>
                    <p className="text-xs text-muted">Describe yourself — AI fills your profile</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-muted hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <FaXmark className="h-4 w-4" />
                </button>
              </div>

              {/* ── Step 1: Input ─────────────────────────────────────────── */}
              {step === 'input' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                    <FaLightbulb className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary-800">
                      Tell me about your experience, education, skills, and what kind of jobs
                      you're looking for. Speak naturally — I'll extract everything automatically.
                    </p>
                  </div>

                  {/* Text area */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. I'm a React developer with 3 years at TCS. I have a B.Tech from VIT, I know JavaScript, Node.js, MongoDB. Looking for remote senior roles paying 18-22 LPA..."
                      rows={5}
                      className="input !rounded-xl resize-none pr-12 text-sm"
                      maxLength={2000}
                    />
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-muted">
                      {text.length}/2000
                    </span>
                  </div>

                  {/* Mic button */}
                  {sttSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stop : start}
                      className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors ${
                        isListening
                          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                          : 'bg-slate-50 border-line text-muted hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      {isListening ? (
                        <><FaStop className="h-3.5 w-3.5" /> Stop recording</>
                      ) : (
                        <><FaMicrophone className="h-3.5 w-3.5" /> Speak instead of typing</>
                      )}
                    </button>
                  )}

                  {/* Live transcript preview */}
                  {isListening && transcript && (
                    <p className="text-xs text-primary-700 italic bg-primary-50 px-3 py-2 rounded-lg">
                      "{transcript}…"
                    </p>
                  )}

                  {/* Example prompts */}
                  <div>
                    <p className="text-xs text-muted font-medium mb-2">Try an example:</p>
                    <div className="space-y-2">
                      {EXAMPLE_PROMPTS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setText(p)}
                          className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 border border-line hover:border-primary-200 rounded-xl px-3 py-2.5 transition-colors line-clamp-2"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={loading || text.trim().length < 10}
                      className="btn-primary flex-1 disabled:opacity-40"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Extracting…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FaWandMagicSparkles className="h-4 w-4" />
                          Extract Profile
                          <FaArrowRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Preview ───────────────────────────────────────── */}
              {step === 'preview' && extracted && (
                <div className="p-5 space-y-4">
                  {/* Summary */}
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FaCircleCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        AI extracted {filledFields} field{filledFields !== 1 ? 's' : ''} from your description
                      </p>
                      <p className="text-xs text-emerald-700">
                        Review below, then click Apply to fill the form. You can edit anything after.
                      </p>
                    </div>
                  </div>

                  {/* Extracted data preview */}
                  <div className="space-y-3 text-sm">
                    {extracted.name && <PreviewRow label="Name" value={extracted.name} />}
                    {extracted.headline && <PreviewRow label="Headline" value={extracted.headline} />}
                    {extracted.phone && <PreviewRow label="Phone" value={extracted.phone} />}
                    {extracted.bio && <PreviewRow label="Bio" value={extracted.bio} />}

                    {extracted.skills?.length > 0 && (
                      <div className="border border-line rounded-xl p-3">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Skills ({extracted.skills.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {extracted.skills.map((s) => (
                            <span key={s} className="badge badge-primary !text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {extracted.experience?.length > 0 && (
                      <div className="border border-line rounded-xl p-3">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Experience ({extracted.experience.length})</p>
                        {extracted.experience.map((e, i) => (
                          <div key={i} className="text-xs text-slate-700 mb-1.5 last:mb-0">
                            <span className="font-medium">{e.role}</span>
                            {e.company && <span className="text-muted"> @ {e.company}</span>}
                            {e.current && <span className="ml-1 text-emerald-600 font-medium">· Current</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {extracted.education?.length > 0 && (
                      <div className="border border-line rounded-xl p-3">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Education ({extracted.education.length})</p>
                        {extracted.education.map((e, i) => (
                          <div key={i} className="text-xs text-slate-700 mb-1.5 last:mb-0">
                            <span className="font-medium">{e.degree}</span>
                            {e.institution && <span className="text-muted"> · {e.institution}</span>}
                            {e.endYear && <span className="text-muted"> · {e.endYear}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {extracted.preferences && Object.values(extracted.preferences).some(Boolean) && (
                      <div className="border border-line rounded-xl p-3">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Preferences</p>
                        {extracted.preferences.preferredJobTitle && (
                          <p className="text-xs text-slate-700">Role: <span className="font-medium">{extracted.preferences.preferredJobTitle}</span></p>
                        )}
                        {extracted.preferences.preferredWorkMode && (
                          <p className="text-xs text-slate-700 mt-0.5">Mode: <span className="font-medium capitalize">{extracted.preferences.preferredWorkMode}</span></p>
                        )}
                        {extracted.preferences.preferredSalary && (
                          <p className="text-xs text-slate-700 mt-0.5">Salary: <span className="font-medium">{extracted.preferences.preferredSalary.toLocaleString()} {extracted.preferences.preferredSalaryCurrency || 'USD'}</span></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="btn-outline flex-1"
                    >
                      ← Edit description
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="btn-primary flex-1"
                    >
                      <FaCircleCheck className="h-4 w-4" />
                      Apply to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}

function PreviewRow({ label, value }) {
  return (
    <div className="border border-line rounded-xl p-3">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 leading-snug">{value}</p>
    </div>
  );
}
