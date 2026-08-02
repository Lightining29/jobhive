/**
 * VoiceSettings — portalled settings panel.
 *
 * Renders into document.body (escaping overflow:hidden) and anchors
 * to the bottom-right corner of the viewport — same corner the assistant
 * always lives in.  No JS positioning needed.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaXmark,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
  FaGlobe,
  FaMicrochip,
} from 'react-icons/fa6';
import { KOKORO_VOICES } from '../../hooks/useKokoroTTS';

const STT_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
];

const AUDIO_FORMATS = [
  { value: 'mp3',  label: 'MP3' },
  { value: 'wav',  label: 'WAV' },
  { value: 'opus', label: 'Opus' },
];

export default function VoiceSettings({ isOpen, onClose, settings, onChange, kokoroAvailable }) {

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop — catches outside clicks */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Settings panel — fixed, bottom-right above the assistant */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-[9999] w-80 card p-4 shadow-lift overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            role="dialog"
            aria-label="Voice settings"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ink">Voice Settings</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted hover:bg-slate-100 transition-colors"
                aria-label="Close settings"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>

            {/* Auto-speak toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-line">
              <div>
                <p className="text-sm font-medium text-ink">Auto-speak replies</p>
                <p className="text-xs text-muted">AI reads responses aloud</p>
              </div>
              <button
                onClick={() => onChange({ ...settings, autoSpeak: !settings.autoSpeak })}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  settings.autoSpeak ? 'bg-primary-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={settings.autoSpeak}
                aria-label="Toggle auto-speak"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    settings.autoSpeak ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Kokoro voice picker */}
            <div className="py-2.5 border-b border-line">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FaMicrochip className="h-3.5 w-3.5 text-muted" />
                  <p className="text-sm font-medium text-ink">Kokoro voice</p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    kokoroAvailable === true
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : kokoroAvailable === false
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-50 text-slate-500 border border-line'
                  }`}
                >
                  {kokoroAvailable === true ? '● online'
                    : kokoroAvailable === false ? '● fallback'
                    : '● …'}
                </span>
              </div>
              <select
                value={settings.kokoroVoice || 'af_heart'}
                onChange={(e) => onChange({ ...settings, kokoroVoice: e.target.value })}
                className="input !py-2 !text-sm"
                aria-label="Kokoro voice"
                disabled={kokoroAvailable === false}
              >
                {KOKORO_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              {kokoroAvailable === false && (
                <p className="text-[10px] text-amber-600 mt-1.5 leading-relaxed">
                  Kokoro offline — using browser TTS.<br />
                  Start:{' '}
                  <code className="bg-amber-50 px-1 py-0.5 rounded text-[10px]">
                    docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2
                  </code>
                </p>
              )}
            </div>

            {/* Audio format */}
            <div className="py-2.5 border-b border-line">
              <p className="text-sm font-medium text-ink mb-2">Audio format</p>
              <div className="flex gap-1.5">
                {AUDIO_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onChange({ ...settings, ttsFormat: f.value })}
                    disabled={kokoroAvailable === false}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      (settings.ttsFormat || 'mp3') === f.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-line hover:border-primary-300 disabled:opacity-40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speech speed */}
            <div className="py-2.5 border-b border-line">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-ink">Speech speed</p>
                <span className="text-xs text-muted font-mono">{(settings.rate || 1.0).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1"
                value={settings.rate || 1.0}
                onChange={(e) => onChange({ ...settings, rate: parseFloat(e.target.value) })}
                className="w-full accent-primary-600"
                aria-label="Speech rate"
              />
              <div className="flex justify-between text-[10px] text-muted mt-0.5">
                <span>Slow</span><span>Normal</span><span>Fast</span>
              </div>
            </div>

            {/* Volume */}
            <div className="py-2.5 border-b border-line">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {(settings.volume ?? 1) === 0
                    ? <FaVolumeXmark className="h-3.5 w-3.5 text-muted" />
                    : (settings.volume ?? 1) < 0.5
                    ? <FaVolumeLow className="h-3.5 w-3.5 text-muted" />
                    : <FaVolumeHigh className="h-3.5 w-3.5 text-muted" />}
                  <p className="text-sm font-medium text-ink">Volume</p>
                </div>
                <span className="text-xs text-muted font-mono">
                  {Math.round((settings.volume ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={settings.volume ?? 1}
                onChange={(e) => onChange({ ...settings, volume: parseFloat(e.target.value) })}
                className="w-full accent-primary-600"
                aria-label="Volume"
              />
            </div>

            {/* STT language */}
            <div className="pt-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <FaGlobe className="h-3.5 w-3.5 text-muted" />
                <p className="text-sm font-medium text-ink">Mic language</p>
              </div>
              <select
                value={settings.lang || 'en-US'}
                onChange={(e) => onChange({ ...settings, lang: e.target.value })}
                className="input !py-2 !text-sm"
                aria-label="Speech recognition language"
              >
                {STT_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}
