/**
 * useVoiceSocket — manages the Socket.IO connection for the Voice AI feature.
 * Returns state + action methods consumed by VoiceAssistant.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// Supports separate frontend & backend deployments (VITE_SOCKET_URL or derived from VITE_API_URL)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5000');

const SESSION_STORAGE_KEY = 'voice_session_id';

function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return uuidv4();
  }
}

/**
 * @typedef {Object} VoiceMessage
 * @property {'user'|'assistant'} role
 * @property {string} text
 * @property {string} id
 * @property {number} timestamp
 * @property {string} [intent]
 * @property {Array} [jobs]
 * @property {number} [total]
 * @property {Object} [stats]
 * @property {Object} [jobDetail]
 * @property {Object} [company]
 * @property {string} [link]
 * @property {string} [linkTab]
 * @property {Object} [parsedQuery]
 * @property {Object} [rawQuery]
 */

export function useVoiceSocket() {
  const socketRef = useRef(null);
  const sessionId = useRef(getOrCreateSessionId());

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [lastJobs, setLastJobs] = useState([]);
  const [lastTotal, setLastTotal] = useState(0);
  const retryCountRef = useRef(0);

  // Accumulate streaming tokens
  const streamBufferRef = useRef('');

  // ── Connect ─────────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Clean up any dead socket before creating a new one
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    retryCountRef.current = 0;
    setError(null);

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      retryCountRef.current = 0;
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      retryCountRef.current += 1;
      // Only surface the error to the user after 2 failed attempts
      if (retryCountRef.current >= 2) {
        setError('Connection failed. Check the server is running.');
      }
    });

    socket.on('reconnect', () => {
      setConnected(true);
      setError(null);
      retryCountRef.current = 0;
    });

    socket.on('reconnect_failed', () => {
      setError('Could not connect to AI. Please refresh the page.');
    });

    // ── Voice events ───────────────────────────────────────────────────────
    socket.on('voice:thinking', () => {
      setIsThinking(true);
      setIsStreaming(false);
      streamBufferRef.current = '';
      setStreamingText('');
    });

    socket.on('voice:token', ({ token }) => {
      setIsThinking(false);
      setIsStreaming(true);
      streamBufferRef.current += token;
      setStreamingText(streamBufferRef.current);
    });

    socket.on('voice:done', ({ text, intent, jobs, total, stats, jobDetail, company, link, linkTab, parsedQuery, rawQuery }) => {
      setIsThinking(false);
      setIsStreaming(false);

      const finalText = text || streamBufferRef.current;
      streamBufferRef.current = '';
      setStreamingText('');

      const msg = {
        id: uuidv4(),
        role: 'assistant',
        text: finalText,
        intent,
        jobs,
        total,
        stats,
        jobDetail,
        company,
        link,
        linkTab,
        parsedQuery,
        rawQuery,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, msg]);

      if (jobs?.length) {
        setLastJobs(jobs);
        setLastTotal(total || jobs.length);
      }
    });

    socket.on('voice:error', ({ message }) => {
      setIsThinking(false);
      setIsStreaming(false);
      setError(message);
    });

    socket.on('voice:cleared', () => {
      setMessages([]);
      setLastJobs([]);
      setLastTotal(0);
    });
  }, []);

  // ── Disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // ── Send message — clears error, adds user msg, emits to socket ────────────
  const sendMessage = useCallback((text) => {
    if (!text?.trim()) return;
    if (!socketRef.current?.connected) {
      setError('Not connected. Please wait…');
      return;
    }

    // Clear any streaming state from a previous interrupted response
    streamBufferRef.current = '';
    setStreamingText('');
    setIsThinking(false);
    setIsStreaming(false);

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setError(null);

    socketRef.current.emit('voice:chat', {
      text: text.trim(),
      sessionId: sessionId.current,
    });
  }, []);

  // ── Set page context (so AI knows which job/page user is on) ────────────────
  const setPageContext = useCallback((ctx) => {
    socketRef.current?.emit('voice:context', ctx);
  }, []);

  // ── Clear conversation ──────────────────────────────────────────────────────
  const clearConversation = useCallback(() => {
    socketRef.current?.emit('voice:clear', { sessionId: sessionId.current });
    // Optimistic local clear
    setMessages([]);
    setLastJobs([]);
    setLastTotal(0);
    sessionId.current = uuidv4();
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId.current);
    } catch {
      // ignore
    }
  }, []);

  // ── Auto-connect on mount, cleanup on unmount ───────────────────────────────
  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);

  return {
    connected,
    messages,
    streamingText,
    isThinking,
    isStreaming,
    error,
    lastJobs,
    lastTotal,
    sendMessage,
    setPageContext,
    clearConversation,
    reconnect: connect,
    sessionId: sessionId.current,
  };
}
