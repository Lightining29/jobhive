/**
 * Voice AI REST API calls — complement to the Socket.IO real-time channel.
 */
import api from './api';

const voiceApi = {
  /** Check AI service health */
  health: () => api.get('/voice/health'),

  /** Get conversation history */
  history: () => api.get('/voice/history'),

  /** Clear conversation history (optionally pass sessionId) */
  clearHistory: (sessionId) =>
    api.delete('/voice/history', { params: sessionId ? { sessionId } : undefined }),

  /** REST fallback: send a text message */
  chat: (text, sessionId = 'rest') => api.post('/voice/chat', { text, sessionId }),
};

export default voiceApi;
