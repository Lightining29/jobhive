/**
 * VoiceAssistant — the expanded voice chat panel.
 * Rendered by FloatingAssistant when the panel is open.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaXmark,
  FaTrash,
  FaGear,
  FaVolumeHigh,
  FaVolumeXmark,
  FaPaperPlane,
  FaWifi,
  FaCircleXmark,
} from 'react-icons/fa6';
import { useVoiceSocket } from '../../hooks/useVoiceSocket';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useKokoroTTS } from '../../hooks/useKokoroTTS';
import { useLocalStorage } from '../../hooks/index';
import AIAvatar from './AIAvatar';
import Canvas3DBot from './Canvas3DBot';
import MicButton from './MicButton';
import VoiceWave from './VoiceWave';
import ConversationPanel from './ConversationPanel';
import VoiceSettings from './VoiceSettings';

const DEFAULT_SETTINGS = {
  autoSpeak: true,
  rate: 1.0,
  volume: 1.0,
  lang: 'hi-IN',
  kokoroVoice: 'hi-IN-Neural2-A',
  ttsFormat: 'mp3',
};

export default function VoiceAssistant({ onClose, pageContext }) {
  const [textInput, setTextInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage('voice_settings', DEFAULT_SETTINGS);
  const inputRef = useRef(null);

  // ── Socket connection ──────────────────────────────────────────────────────
  const {
    connected,
    messages,
    streamingText,
    isThinking,
    isStreaming,
    error: socketError,
    sendMessage,
    setPageContext,
    clearConversation,
    reconnect,
  } = useVoiceSocket();

  // ── Browser Speech Recognition ────────────────────────────────────────────
  const { isSupported: sttSupported, isListening, transcript, start, stop, error: sttError } =
    useSpeechRecognition({
      lang: settings.lang || 'en-US',
      onFinalTranscript: (text) => {
        if (text.trim()) {
          sendMessage(text);
          // Don't keep listening after sending — wait for AI response
          // The mic button can be clicked again to continue
        }
      },
    });

  // ── Kokoro TTS ────────────────────────────────────────────────────────────
  const { isSpeaking, isLoading: ttsLoading, speak, cancel: cancelTTS, usingFallback, kokoroAvailable } = useKokoroTTS({
    voice: settings.kokoroVoice || 'af_heart',
    speed: settings.rate,
    volume: settings.volume,
    format: settings.ttsFormat || 'mp3',
    lang: settings.lang,
  });

  // Auto-speak last assistant message — stop mic first
  useEffect(() => {
    if (!settings.autoSpeak) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && last.text) {
      if (isListening) stop();   // don't speak while mic is open
      speak(last.text);
    }
  }, [messages, settings.autoSpeak, speak, isListening, stop]);

  // Set page context whenever it changes
  useEffect(() => {
    if (pageContext) {
      setPageContext(pageContext);
    }
  }, [pageContext, setPageContext]);

  // ── Determine AI mode for animations ─────────────────────────────────────
  const aiMode = isThinking ? 'thinking' : isStreaming ? 'speaking' : isSpeaking || ttsLoading ? 'speaking' : isListening ? 'listening' : 'idle';

  // ── Send text message — also cancels TTS and mic ────────────────────────
  const handleSend = useCallback(() => {
    const text = textInput.trim();
    if (!text) return;
    // Stop mic and TTS before sending
    if (isListening) stop();
    if (isSpeaking) cancelTTS();
    sendMessage(text);
    setTextInput('');
    inputRef.current?.focus();
  }, [textInput, sendMessage, isListening, stop, isSpeaking, cancelTTS]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Mic toggle — cancel TTS when starting mic ────────────────────────────
  const handleMicToggle = () => {
    if (isListening) {
      stop();
    } else {
      if (isSpeaking) cancelTTS();  // stop AI speaking when user wants to talk
      start();
    }
  };

  const displayError = socketError || sttError;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex flex-col w-[380px] max-w-[95vw] h-[580px] max-h-[85vh] glass-card shadow-lift overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="JobHive AI Voice Assistant"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line/60 bg-white/60">
        <Canvas3DBot mode={aiMode} size={46} interactive={true} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-ink">Job Workplace AI (3D Bot)</p>
            <span
              className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-300'}`}
              title={connected ? 'Connected' : 'Disconnected'}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <VoiceWave mode={aiMode} size="sm" />
            <p className="text-[10px] text-muted capitalize">
              {ttsLoading
                ? 'generating Hindi voice…'
                : isSpeaking
                ? 'Speaking...'
                : aiMode === 'idle'
                ? connected ? 'Ready • हिंदी & English' : 'connecting…'
                : aiMode}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          {/* TTS toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                cancelTTS();
              } else {
                setSettings((s) => ({ ...s, autoSpeak: !s.autoSpeak }));
              }
            }}
            className={`p-2 rounded-xl transition-colors ${
              settings.autoSpeak || isSpeaking
                ? 'text-primary-600 bg-primary-50'
                : 'text-muted hover:bg-slate-100'
            }`}
            title={isSpeaking ? 'Stop speaking' : settings.autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
            aria-label="Toggle speech output"
          >
            {settings.autoSpeak || isSpeaking ? (
              <FaVolumeHigh className="h-4 w-4" />
            ) : (
              <FaVolumeXmark className="h-4 w-4" />
            )}
          </button>

          {/* Reconnect if disconnected */}
          {!connected && (
            <button
              onClick={reconnect}
              className="p-2 rounded-xl text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors"
              title="Reconnect"
              aria-label="Reconnect to AI"
            >
              <FaWifi className="h-4 w-4" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className={`p-2 rounded-xl transition-colors ${settingsOpen ? 'text-primary-600 bg-primary-50' : 'text-muted hover:bg-slate-100'}`}
            aria-label="Voice settings"
            aria-expanded={settingsOpen}
          >
            <FaGear className="h-4 w-4" />
          </button>
          <VoiceSettings
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onChange={setSettings}
            kokoroAvailable={kokoroAvailable}
          />
          {/* Clear */}
          <button
            onClick={clearConversation}
            className="p-2 rounded-xl text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <FaTrash className="h-4 w-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:bg-slate-100 transition-colors"
            aria-label="Close assistant"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {displayError && (
        <div className="flex items-center gap-2 mx-3 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <FaCircleXmark className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">{displayError}</span>
        </div>
      )}

      {/* ── Live transcript preview ──────────────────────────────────────────── */}
      {isListening && transcript && (
        <div className="mx-3 mt-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-700 italic">
          "{transcript}…"
        </div>
      )}

      {/* ── Conversation ─────────────────────────────────────────────────────── */}
      <ConversationPanel
        messages={messages}
        streamingText={streamingText}
        isThinking={isThinking}
        isStreaming={isStreaming}
        aiMode={aiMode}
        className="flex-1"
      />

      {/* ── Input area ──────────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-line/60 bg-white/60">
        {/* Suggestion pills — shown when conversation is empty */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {['Java jobs in Delhi', 'Remote React roles', 'Interview tips', 'My resume score'].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 rounded-full px-2.5 py-1 transition-colors border border-transparent hover:border-primary-200"
                >
                  {s}
                </button>
              )
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Mic button */}
          <MicButton
            isListening={isListening}
            isDisabled={!sttSupported || !connected || isThinking || isStreaming}
            onClick={handleMicToggle}
            size="md"
          />

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? 'Listening…' : sttSupported ? 'Type or speak…' : 'Ask anything…'
            }
            disabled={isThinking || isStreaming}
            className="flex-1 input !py-2 !text-sm disabled:opacity-60"
            maxLength={500}
            aria-label="Voice assistant text input"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!textInput.trim() || isThinking || isStreaming || !connected}
            className="btn-primary !py-2 !px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <FaPaperPlane className="h-4 w-4" />
          </button>
        </div>

        {!sttSupported && (
          <p className="text-[10px] text-muted text-center mt-1.5">
            Voice input not supported in this browser. Text mode available.
          </p>
        )}
      </div>
    </motion.div>
  );
}
