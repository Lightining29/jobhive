/**
 * useKokoroTTS — plays AI responses using Kokoro TTS via the backend proxy.
 *
 * Flow:
 *   text → POST /api/voice/tts → Kokoro server → audio/mpeg stream
 *        → Blob URL → <audio> element → speaker
 *
 * Automatically falls back to the browser's Web Speech Synthesis API
 * when Kokoro is offline (backend returns 503 with { fallback: true }).
 *
 * Settings come from the VoiceSettings panel (voice, speed, volume, format).
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const KOKORO_VOICES = [
  { id: 'af_heart',    label: 'Heart (US Female — Most Natural)', lang: 'en-US' },
  { id: 'af_sarah',    label: 'Sarah (US Female)',     lang: 'en-US' },
  { id: 'af_bella',    label: 'Bella (US Female)',     lang: 'en-US' },
  { id: 'af_nicole',   label: 'Nicole (US Female)',    lang: 'en-US' },
  { id: 'af_sky',      label: 'Sky (US Female)',       lang: 'en-US' },
  { id: 'am_adam',     label: 'Adam (US Male)',        lang: 'en-US' },
  { id: 'am_michael',  label: 'Michael (US Male)',     lang: 'en-US' },
  { id: 'bf_emma',     label: 'Emma (UK Female)',      lang: 'en-GB' },
  { id: 'bf_isabella', label: 'Isabella (UK Female)',  lang: 'en-GB' },
  { id: 'bm_george',   label: 'George (UK Male)',      lang: 'en-GB' },
  { id: 'bm_lewis',    label: 'Lewis (UK Male)',       lang: 'en-GB' },
];

const DEFAULT_VOICE = 'af_heart';  // Most natural-sounding female voice
const DEFAULT_SPEED = 0.95;         // Slightly slower than 1.0 for more natural pacing

// ── Browser TTS fallback ─────────────────────────────────────────────────────
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

function browserSpeak(text, { rate = 1.0, volume = 1.0, lang = 'en-US', onStart, onEnd } = {}) {
  if (!synth) return;
  synth.cancel();
  const cleaned = text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\n+/g, ' ').trim();

  function doSpeak() {
    const utt = new SpeechSynthesisUtterance(cleaned);
    utt.rate = rate;
    utt.volume = volume;
    utt.lang = lang;

    const voices = synth.getVoices();
    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'samantha', 'victoria',
      'karen', 'moira', 'tessa', 'fiona', 'allison', 'ava', 'susan', 'emma',
      'lisa', 'sarah', 'aria', 'jenny', 'sonia', 'natasha', 'veena', 'raveena'];

    const female =
      voices.find((v) => v.lang === lang      && femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
      voices.find((v) => v.lang === 'en-US'   && femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
      voices.find((v) => v.lang.startsWith('en') && femaleKeywords.some((k) => v.name.toLowerCase().includes(k))) ||
      voices.find((v) => ['Microsoft Zira', 'Samantha', 'Karen', 'Moira', 'Tessa',
        'Microsoft Jenny', 'Aria'].some((n) => v.name.includes(n))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (female) utt.voice = female;
    utt.onstart = onStart;
    utt.onend   = onEnd;
    utt.onerror = onEnd;
    synth.speak(utt);
  }

  // Voices may not be loaded yet on first call
  const voices = synth.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      doSpeak();
    };
  }
}

function browserCancel() {
  synth?.cancel();
}

// ── Main hook ────────────────────────────────────────────────────────────────

export function useKokoroTTS({
  voice = DEFAULT_VOICE,
  speed = DEFAULT_SPEED,
  volume = 1.0,
  format = 'mp3',
  lang = 'en-US',
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [kokoroAvailable, setKokoroAvailable] = useState(null); // null = unknown

  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const abortRef = useRef(null);

  // Check Kokoro availability once on mount
  useEffect(() => {
    let mounted = true;
    fetch('/api/voice/tts/voices')
      .then((r) => r.json())
      .then((d) => { if (mounted) setKokoroAvailable(d.available === true); })
      .catch(() => { if (mounted) setKokoroAvailable(false); });
    return () => { mounted = false; };
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      abortRef.current?.abort();
      browserCancel();
    };
  }, []);

  const cancel = useCallback(() => {
    // Stop Kokoro audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    abortRef.current?.abort();

    // Stop browser TTS fallback
    browserCancel();

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text) => {
      if (!text?.trim()) return;
      cancel(); // stop anything playing

      setIsLoading(true);

      // If we already know Kokoro is offline, go straight to fallback
      if (kokoroAvailable === false) {
        setIsLoading(false);
        setUsingFallback(true);
        setIsSpeaking(true);
        browserSpeak(text, {
          rate: speed,
          volume,
          lang,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
        return;
      }

      try {
        abortRef.current = new AbortController();

        const res = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: text.trim(), voice, speed, format }),
          signal: abortRef.current.signal,
        });

        // 503 = Kokoro offline → use browser fallback
        if (res.status === 503) {
          const json = await res.json().catch(() => ({}));
          if (json.fallback) {
            setKokoroAvailable(false);
            setUsingFallback(true);
            setIsLoading(false);
            setIsSpeaking(true);
            browserSpeak(text, {
              rate: speed,
              volume,
              lang,
              onStart: () => setIsSpeaking(true),
              onEnd: () => setIsSpeaking(false),
            });
            return;
          }
        }

        if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

        setKokoroAvailable(true);
        setUsingFallback(false);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // Revoke previous blob
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = volume;

        audio.onplay = () => { setIsSpeaking(true); setIsLoading(false); };
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          blobUrlRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsLoading(false);
        };

        setIsLoading(false);
        await audio.play();
      } catch (err) {
        if (err.name === 'AbortError') return; // cancelled intentionally
        // Any other error → browser fallback
        setKokoroAvailable(false);
        setUsingFallback(true);
        setIsLoading(false);
        setIsSpeaking(true);
        browserSpeak(text, {
          rate: speed,
          volume,
          lang,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    },
    [voice, speed, volume, format, lang, kokoroAvailable, cancel]
  );

  return {
    speak,
    cancel,
    isSpeaking,
    isLoading,
    usingFallback,
    kokoroAvailable,
    isSupported: true, // always supported (Kokoro or browser fallback)
    voices: KOKORO_VOICES,
  };
}

export { KOKORO_VOICES };
