/**
 * VoiceAssistant — clean voice and text assistant panel without TTS audio.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaXmark,
  FaTrash,
  FaPaperPlane,
  FaWifi,
  FaCircleXmark,
} from 'react-icons/fa6';
import { useVoiceSocket } from '../../hooks/useVoiceSocket';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useLocalStorage } from '../../hooks/index';
import Canvas3DBot from './Canvas3DBot';
import MicButton from './MicButton';
import VoiceWave from './VoiceWave';
import ConversationPanel from './ConversationPanel';

const DEFAULT_SETTINGS = {
  lang: 'en-IN',
};

export default function VoiceAssistant({ onClose, pageContext }) {
  const [textInput, setTextInput] = useState('');
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
      lang: settings.lang || 'en-IN',
      onFinalTranscript: (text) => {
        if (text.trim()) {
          sendMessage(text);
        }
      },
    });

  // Set page context whenever it changes
  useEffect(() => {
    if (pageContext) {
      setPageContext(pageContext);
    }
  }, [pageContext, setPageContext]);

  // ── Determine AI mode for animations ─────────────────────────────────────
  const aiMode = isThinking ? 'thinking' : isStreaming ? 'speaking' : isListening ? 'listening' : 'idle';

  // ── Send text message ───────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    if (isListening) stop();
    sendMessage(trimmed);
    setTextInput('');
    inputRef.current?.focus();
  }, [textInput, sendMessage, isListening, stop]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Mic button toggle ─────────────────────────────────────────────────────
  const handleMicToggle = () => {
    if (isListening) {
      stop();
    } else {
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
            <p className="text-sm font-bold text-ink">Job Workplace AI</p>
            <span
              className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-300'}`}
              title={connected ? 'Connected' : 'Disconnected'}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <VoiceWave mode={aiMode} size="sm" />
            <p className="text-[10px] text-muted capitalize">
              {aiMode === 'idle'
                ? connected ? (settings.lang === 'hi-IN' ? 'हिंदी मोड • सक्रिय' : 'English Mode • Ready') : 'connecting…'
                : aiMode}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          {/* Quick Lang Switch */}
          <button
            onClick={() => {
              const newLang = settings.lang === 'hi-IN' ? 'en-IN' : 'hi-IN';
              setSettings((s) => ({ ...s, lang: newLang }));
            }}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 transition-colors border border-slate-200"
            title="Click to toggle English / Hindi voice recognition"
          >
            {settings.lang === 'hi-IN' ? '🇮🇳 हिन्दी' : '🇮🇳 Eng'}
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
      {isListening && (
        <div className="mx-3 mt-2 px-3 py-2 bg-primary-50/90 border border-primary-300 rounded-xl text-xs text-primary-900 flex items-center gap-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-primary-700">Hearing:</span>
          <span className="flex-1 italic truncate">
            {transcript ? `"${transcript}"` : 'Speak now...'}
          </span>
          <span className="text-[10px] text-muted">(Tap mic to finish)</span>
        </div>
      )}

      {/* ── Conversation History ────────────────────────────────────────────── */}
      <ConversationPanel
        messages={messages}
        streamingText={streamingText}
        isThinking={isThinking}
        isStreaming={isStreaming}
        aiMode={aiMode}
        className="flex-1"
      />

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-line/60 bg-white/60">
        {/* Quick query chips on empty state */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              'Java jobs in Delhi',
              'MERN Stack Noida',
              'Remote React roles',
              'Interview tips',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="text-[11px] bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 rounded-full px-2.5 py-1 transition-colors border border-transparent hover:border-primary-200"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Push-to-talk mic button */}
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
              isListening
                ? 'Listening…'
                : sttSupported
                ? 'Type or speak…'
                : 'Ask anything…'
            }
            disabled={isThinking || isStreaming}
            className="flex-1 input !py-2 !text-sm disabled:opacity-60"
            maxLength={500}
            aria-label="Voice assistant text input"
          />

          {/* Send text button */}
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
