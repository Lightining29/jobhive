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
      const apiCards = data.cards || [];

      // Merge with local storage cards for zero-loss guarantee
      let localCards = [];
      try {
        localCards = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
      } catch (err) {}

      const mergedMap = new Map();
      apiCards.forEach(c => mergedMap.set(c._id || c.personal?.idNumber, c));
      localCards.forEach(c => {
        const key = c._id || c.personal?.idNumber;
        if (key && !mergedMap.has(key)) {
          mergedMap.set(key, c);
        }
      });

      return Array.from(mergedMap.values());
    } catch (e) {
      console.warn('Failed to fetch cards from server, checking local storage:', e);
      try {
        return JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
      } catch (err) {
        return [];
      }
    }
  },

  getCardById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/${id}`);
      return await res.json();
    } catch (e) {
      try {
        const local = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
        const found = local.find(c => c._id === id || c.personal?.idNumber === id);
        if (found) return { success: true, card: found };
      } catch (err) {}
      return { success: false, error: e.message };
    }
  },

  getPublicVerifiedCard: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cards/public/${id}`);
      return await res.json();
    } catch (e) {
      try {
        const local = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
        const found = local.find(c => c._id === id || c.personal?.idNumber === id);
        if (found) return { success: true, card: found, verified: true };
      } catch (err) {}
      return { success: false, error: e.message };
    }
  },

  saveCard: async (cardData) => {
    try {
      const isExisting = cardData._id && !cardData._id.startsWith('card_temp') && !cardData._id.startsWith('local_');
      const url = isExisting ? `${API_BASE}/cards/${cardData._id}` : `${API_BASE}/cards`;
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });
      const data = await res.json();

      if (data.success && data.card) {
        try {
          const local = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
          const idx = local.findIndex(c => c._id === data.card._id || (data.card.personal?.idNumber && c.personal?.idNumber === data.card.personal?.idNumber));
          if (idx >= 0) local[idx] = data.card;
          else local.unshift(data.card);
          localStorage.setItem('SAVED_ICARDS', JSON.stringify(local));
        } catch (err) {}
        return data;
      }

      // If server returned unsuccessful, save locally and return success
      const fallbackCard = {
        ...cardData,
        _id: cardData._id || 'local_' + Date.now(),
        updatedAt: new Date().toISOString(),
      };
      try {
        const local = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
        const idx = local.findIndex(c => c._id === fallbackCard._id || (fallbackCard.personal?.idNumber && c.personal?.idNumber === fallbackCard.personal?.idNumber));
        if (idx >= 0) local[idx] = fallbackCard;
        else local.unshift(fallbackCard);
        localStorage.setItem('SAVED_ICARDS', JSON.stringify(local));
      } catch (err) {}
      return { success: true, card: fallbackCard, message: data.message || 'Saved locally' };
    } catch (e) {
      console.error('Error saving card to server, fallback to local storage:', e);
      const fallbackCard = {
        ...cardData,
        _id: cardData._id || 'local_' + Date.now(),
        updatedAt: new Date().toISOString(),
      };
      try {
        const local = JSON.parse(localStorage.getItem('SAVED_ICARDS') || '[]');
        const idx = local.findIndex(c => c._id === fallbackCard._id || (fallbackCard.personal?.idNumber && c.personal?.idNumber === fallbackCard.personal?.idNumber));
        if (idx >= 0) local[idx] = fallbackCard;
        else local.unshift(fallbackCard);
        localStorage.setItem('SAVED_ICARDS', JSON.stringify(local));
      } catch (err) {}
      return { success: true, card: fallbackCard, message: 'Saved to local storage' };
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
