/**
/**
 * useSpeechRecognition — robust, real-time Web Speech API wrapper.
 *
 * Capabilities:
 *  - Continuous listening with live interim feedback
 *  - Accurate silence detection (auto-submits after 2s of silence)
 *  - Manual stop sends full accumulated text (including trailing interim speech)
 *  - Auto-restart resilience on unexpected browser drops
 *  - Multi-language support (en-IN, hi-IN, en-US)
 */
import { useState, useRef, useCallback, useEffect } from 'react';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// Silence timeout: auto-stop and submit 2 seconds after user stops speaking
const SILENCE_TIMEOUT_MS = 2000;

export function useSpeechRecognition({ lang = 'en-IN', onFinalTranscript, continuous = true } = {}) {
  const [isListening, setIsListening]       = useState(false);
  const [transcript, setTranscript]         = useState('');   // live interim
  const [finalTranscript, setFinalTranscript] = useState(''); // committed text
  const [error, setError]                   = useState(null);
  const [isSupported, setIsSupported]       = useState(false);

  const recognitionRef   = useRef(null);
  const silenceTimerRef  = useRef(null);
  const shouldRestartRef = useRef(false);
  const accumulatedRef   = useRef('');
  const interimRef       = useRef('');
  const callbackRef      = useRef(onFinalTranscript);
  const isManuallyStoppingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognition()));
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Submit complete speech session
  const submitSpeech = useCallback(() => {
    clearSilenceTimer();
    const fullText = (accumulatedRef.current + ' ' + interimRef.current).trim();
    if (fullText) {
      callbackRef.current?.(fullText);
    }
    accumulatedRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setFinalTranscript('');
  }, []);

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        shouldRestartRef.current = false;
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      submitSpeech();
      setIsListening(false);
    }, SILENCE_TIMEOUT_MS);
  }, [submitSpeech]);

  // ── Create Recognition ─────────────────────────────────────────────────────
  const createRecognition = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return null;

    const recognition = new SR();
    recognition.lang            = lang || 'en-IN';
    recognition.continuous      = continuous;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      isManuallyStoppingRef.current = false;
    };

    recognition.onresult = (event) => {
      clearSilenceTimer();

      let currentInterim = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (newFinal) {
        accumulatedRef.current = (accumulatedRef.current ? accumulatedRef.current + ' ' : '') + newFinal.trim();
        setFinalTranscript(accumulatedRef.current);
      }

      interimRef.current = currentInterim;
      setTranscript(currentInterim || accumulatedRef.current);

      // Trigger silence countdown
      scheduleSilenceStop();
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please click the lock/settings icon in your browser address bar and allow microphone permissions.');
        shouldRestartRef.current = false;
        setIsListening(false);
        return;
      }

      if (event.error === 'no-speech') {
        shouldRestartRef.current = false;
        return;
      }

      if (event.error === 'network') {
        setError('Speech recognition network error. Please check your internet connection.');
        shouldRestartRef.current = false;
        setIsListening(false);
        return;
      }

      if (event.error === 'aborted') {
        return;
      }

      setError(`Microphone error (${event.error}). Please click the mic button to try again.`);
    };

    recognition.onend = () => {
      clearSilenceTimer();

      // If user did not manually stop and silence timer didn't finish, auto-submit
      if (!isManuallyStoppingRef.current && (accumulatedRef.current || interimRef.current)) {
        submitSpeech();
      }

      if (shouldRestartRef.current && continuous) {
        try {
          recognition.start();
          return;
        } catch {
          // Fall through
        }
      }

      setIsListening(false);
    };

    return recognition;
  }, [lang, continuous, scheduleSilenceStop, submitSpeech]);

  // ── Start listening ────────────────────────────────────────────────────────
  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    accumulatedRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setFinalTranscript('');
    setError(null);
    isManuallyStoppingRef.current = false;

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
      setError('Could not start microphone. Please check permissions.');
      shouldRestartRef.current = false;
    }
  }, [createRecognition]);

  // ── Stop listening & submit ────────────────────────────────────────────────
  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    isManuallyStoppingRef.current = true;
    clearSilenceTimer();

    submitSpeech();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }

    setIsListening(false);
  }, [submitSpeech]);

  const reset = useCallback(() => {
    accumulatedRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

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
