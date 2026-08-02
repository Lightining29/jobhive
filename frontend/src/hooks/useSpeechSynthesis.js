/**
 * useSpeechSynthesis — wraps the Web Speech Synthesis API for TTS.
 * Uses the browser's built-in TTS engine — zero external dependencies.
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function useSpeechSynthesis({ rate = 1.0, pitch = 1.0, volume = 1.0, lang = 'en-US' } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  const isSupported = Boolean(synth);

  const getVoice = useCallback(() => {
    if (!synth) return null;
    const voices = synth.getVoices();
    // Prefer a natural-sounding English voice
    return (
      voices.find((v) => v.lang === lang && v.localService) ||
      voices.find((v) => v.lang.startsWith('en') && v.localService) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }, [lang]);

  const speak = useCallback(
    (text) => {
      if (!synth || !text) return;

      // Cancel any ongoing speech
      synth.cancel();

      // Strip markdown, code blocks, etc for natural speech
      const cleaned = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\n+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utteranceRef.current = utterance;

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = lang;

      const voice = getVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      synth.speak(utterance);
    },
    [rate, pitch, volume, lang, getVoice]
  );

  const pause = useCallback(() => {
    if (synth?.speaking) {
      synth.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (synth?.paused) {
      synth.resume();
      setIsPaused(false);
    }
  }, []);

  const cancel = useCallback(() => {
    synth?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synth?.cancel();
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    cancel,
  };
}
