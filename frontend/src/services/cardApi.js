const API_BASE = '/api';

export const getStoredHfKey = () => {
  return localStorage.getItem('HF_API_KEY') || '';
};

export const setStoredHfKey = (key) => {
  if (!key) {
    localStorage.removeItem('HF_API_KEY');
  } else {
    localStorage.setItem('HF_API_KEY', key.trim());
  }
};

export const cardApi = {
  // Image Upload for Cards (Avatar, Logo, Signature, Background)
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/cards/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.error('Failed to upload card image:', e);
      return { success: false, error: e.message };
    }
  },

  // Cards CRUD
  getCards: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/cards${query ? `?${query}` : ''}`);
      const data = await res.json();
      return data.cards || [];
    } catch (e) {
      console.warn('Failed to fetch cards:', e);
      return [];
    }
  },

  getCardById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/${id}`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getPublicVerifiedCard: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/public/${id}`);
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  saveCard: async (cardData) => {
    try {
      const isExisting = cardData._id && !cardData._id.startsWith('card_temp');
      const url = isExisting ? `${API_BASE}/cards/${cardData._id}` : `${API_BASE}/cards`;
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });
      return await res.json();
    } catch (e) {
      console.error('Error saving card:', e);
      return { success: false, error: e.message };
    }
  },

  deleteCard: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  trackScan: async (id) => {
    try {
      await fetch(`${API_BASE}/cards/${id}/scan`, { method: 'POST' });
    } catch (e) {}
  },

  trackView: async (id) => {
    try {
      await fetch(`${API_BASE}/cards/${id}/view`, { method: 'POST' });
    } catch (e) {}
  },

  // AI with Hugging Face
  generateAITheme: async (prompt) => {
    const apiKey = getStoredHfKey();
    const res = await fetch(`${API_BASE}/ai/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey }),
    });
    return await res.json();
  },

  generateAIBio: async (params) => {
    const apiKey = getStoredHfKey();
    const res = await fetch(`${API_BASE}/ai/bio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, apiKey }),
    });
    return await res.json();
  },

  generateAIAvatar: async (prompt, style = 'cinematic') => {
    const apiKey = getStoredHfKey();
    const res = await fetch(`${API_BASE}/ai/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, apiKey }),
    });
    return await res.json();
  },

  verifyHfKey: async (apiKey) => {
    const res = await fetch(`${API_BASE}/ai/verify-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return await res.json();
  },
};
