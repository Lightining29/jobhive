/**
 * useSpeechRecognition — robust Web Speech API wrapper.
 *
 * Fixes over the previous version:
 *  - continuous=true so it keeps listening across multiple sentences
 *  - onFinalTranscript stored in a ref so start() never needs to be recreated
 *  - Silence detection via a per-utterance timer (resets on every result)
 *  - Auto-restart after unexpected browser end (Chrome kills the session after ~60s)
 *  - SpeechRecognition re-resolved on every start() call so late mic grants work
 *  - Accumulated transcript — builds up across pauses, not just last utterance
 */
import { useState, useRef, useCallback, useEffect } from 'react';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// How long to wait after the last word before auto-stopping (ms)
const SILENCE_TIMEOUT_MS = 2500;

export function useSpeechRecognition({ lang = 'en-US', onFinalTranscript, continuous = true } = {}) {
  const [isListening, setIsListening]       = useState(false);
  const [transcript, setTranscript]         = useState('');   // live interim
  const [finalTranscript, setFinalTranscript] = useState(''); // committed text
  const [error, setError]                   = useState(null);
  const [isSupported, setIsSupported]       = useState(false);

  const recognitionRef   = useRef(null);
  const silenceTimerRef  = useRef(null);
  const shouldRestartRef = useRef(false);   // true while user wants listening on
  const accumulatedRef   = useRef('');      // builds up final text across pauses
  const callbackRef      = useRef(onFinalTranscript);

  // Keep callback ref current without re-creating start()
  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Detect support after mount (handles late browser permission grants)
  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognition()));
  }, []);

  // ── Silence timer — fires when user stops talking ──────────────────────────
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const scheduleSilenceStop = useCallback((stopFn) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(stopFn, SILENCE_TIMEOUT_MS);
  }, []);

  // ── Create and wire a recognition instance ─────────────────────────────────
  const createRecognition = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return null;

    const recognition = new SR();
    recognition.lang             = lang;
    recognition.continuous       = true;   // always continuous — we handle stop ourselves
    recognition.interimResults   = true;
    recognition.maxAlternatives  = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      clearSilenceTimer();

      let interim = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      // Show live interim text
      if (interim) setTranscript(interim);

      if (newFinal) {
        const trimmed = newFinal.trim();
        accumulatedRef.current += (accumulatedRef.current ? ' ' : '') + trimmed;

        setFinalTranscript(accumulatedRef.current);
        setTranscript('');

        // Fire the callback with just this utterance (not the full accumulated)
        callbackRef.current?.(trimmed);
      }

      // Reset silence timer after each word/result
      scheduleSilenceStop(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      });
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Click the lock icon in the address bar and allow microphone.');
        shouldRestartRef.current = false;
        setIsListening(false);
        return;
      }

      if (event.error === 'no-speech') {
        // No speech detected — stop gracefully, don't show error
        shouldRestartRef.current = false;
        return;
      }

      if (event.error === 'network') {
        setError('Network error. Speech recognition requires an internet connection in some browsers.');
        shouldRestartRef.current = false;
        setIsListening(false);
        return;
      }

      if (event.error === 'aborted') {
        // Intentional abort — ignore
        return;
      }

      // Other errors — show but don't block
      setError(`Mic error: ${event.error}. Try clicking the mic button again.`);
    };

    recognition.onend = () => {
      clearSilenceTimer();

      // Auto-restart if still supposed to be listening (Chrome kills session after ~60s)
      if (shouldRestartRef.current && continuous) {
        try {
          recognition.start();
          return;
        } catch {
          // Can't restart — fall through to setIsListening(false)
        }
      }

      setIsListening(false);
    };

    return recognition;
  }, [lang, continuous, scheduleSilenceStop]);

  // ── Start listening ────────────────────────────────────────────────────────
  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Reset accumulated text for a fresh session
    accumulatedRef.current = '';
    setTranscript('');
    setFinalTranscript('');
    setError(null);

    // Abort any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      setError('Could not start microphone. Please try again.');
      shouldRestartRef.current = false;
    }
  }, [createRecognition]);

  // ── Stop listening ─────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    clearSilenceTimer();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }

    setIsListening(false);
  }, []);

  // ── Reset transcript ───────────────────────────────────────────────────────
  const reset = useCallback(() => {
    accumulatedRef.current = '';
    setTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      clearSilenceTimer();
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    start,
    stop,
    reset,
    error,
  };
}
