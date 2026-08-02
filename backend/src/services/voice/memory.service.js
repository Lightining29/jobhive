const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const CONVERSATION_TTL = 24 * 60 * 60 * 1000;

const conversationStore = new Map();

function getConversationId(userId, sessionId) {
  return `${userId}:${sessionId}`;
}

function createConversation(userId, sessionId) {
  const id = getConversationId(userId, sessionId);
  const conversation = {
    id,
    userId,
    sessionId,
    messages: [],
    metadata: {
      createdAt: Date.now(),
      lastActive: Date.now(),
      totalMessages: 0,
      intents: {},
      searchHistory: [],
      preferredSkills: [],
      preferredLocation: '',
      preferredWorkMode: '',
      savedJobIds: [],
      viewedJobIds: [],
    },
  };
  conversationStore.set(id, conversation);
  pruneOldConversations();
  return conversation;
}

function getConversation(userId, sessionId) {
  const id = getConversationId(userId, sessionId);
  let conversation = conversationStore.get(id);
  if (!conversation) {
    conversation = createConversation(userId, sessionId);
  }
  if (isConversationExpired(conversation)) {
    conversation = createConversation(userId, sessionId);
  }
  conversation.metadata.lastActive = Date.now();
  return conversation;
}

function isConversationExpired(conversation) {
  return Date.now() - conversation.metadata.lastActive > CONVERSATION_TTL;
}

function pruneOldConversations() {
  if (conversationStore.size <= MAX_CONVERSATIONS * 10) return;
  const now = Date.now();
  for (const [id, conv] of conversationStore) {
    if (now - conv.metadata.lastActive > CONVERSATION_TTL) {
      conversationStore.delete(id);
    }
  }
}

function addMessage(userId, sessionId, role, content, metadata = {}) {
  const conversation = getConversation(userId, sessionId);
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: Date.now(),
    ...metadata,
  };

  conversation.messages.push(message);
  conversation.metadata.totalMessages++;

  if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  }

  if (metadata.intent) {
    conversation.metadata.intents[metadata.intent] =
      (conversation.metadata.intents[metadata.intent] || 0) + 1;
  }

  return message;
}

function addSearchContext(userId, sessionId, searchParams, results) {
  const conversation = getConversation(userId, sessionId);
  conversation.metadata.searchHistory.push({
    params: searchParams,
    resultCount: results.jobs?.length || 0,
    timestamp: Date.now(),
  });

  if (conversation.metadata.searchHistory.length > 20) {
    conversation.metadata.searchHistory = conversation.metadata.searchHistory.slice(-20);
  }

  if (searchParams.skills) {
    const skills = searchParams.skills.split(',').map((s) => s.trim());
    skills.forEach((skill) => {
      if (!conversation.metadata.preferredSkills.includes(skill)) {
        conversation.metadata.preferredSkills.push(skill);
      }
    });
  }

  if (searchParams.workMode) {
    conversation.metadata.preferredWorkMode = searchParams.workMode;
  }

  if (searchParams.city) {
    conversation.metadata.preferredLocation = searchParams.city;
  }
}

function addSavedJob(userId, sessionId, jobId) {
  const conversation = getConversation(userId, sessionId);
  if (!conversation.metadata.savedJobIds.includes(jobId)) {
    conversation.metadata.savedJobIds.push(jobId);
  }
}

function addViewedJob(userId, sessionId, jobId) {
  const conversation = getConversation(userId, sessionId);
  if (!conversation.metadata.viewedJobIds.includes(jobId)) {
    conversation.metadata.viewedJobIds.push(jobId);
    if (conversation.metadata.viewedJobIds.length > 50) {
      conversation.metadata.viewedJobIds = conversation.metadata.viewedJobIds.slice(-50);
    }
  }
}

function getMemoryContext(userId, sessionId) {
  const conversation = getConversation(userId, sessionId);
  const recentMessages = conversation.messages.slice(-10);
  const meta = conversation.metadata;

  const recentIntents = Object.entries(meta.intents)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent]) => intent);

  return {
    recentMessages: recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    recentIntents,
    searchHistory: meta.searchHistory.slice(-5),
    preferredSkills: meta.preferredSkills,
    preferredLocation: meta.preferredLocation,
    preferredWorkMode: meta.preferredWorkMode,
    savedJobCount: meta.savedJobIds.length,
    viewedJobCount: meta.viewedJobIds.length,
    totalMessages: meta.totalMessages,
    conversationDuration: Date.now() - meta.createdAt,
  };
}

function buildMemoryPrompt(userId, sessionId) {
  const ctx = getMemoryContext(userId, sessionId);
  if (ctx.totalMessages === 0) return '';

  const parts = [];

  if (ctx.preferredSkills.length) {
    parts.push(`User's known skills: ${ctx.preferredSkills.join(', ')}`);
  }
  if (ctx.preferredLocation) {
    parts.push(`User's preferred location: ${ctx.preferredLocation}`);
  }
  if (ctx.preferredWorkMode) {
    parts.push(`User's preferred work mode: ${ctx.preferredWorkMode}`);
  }
  if (ctx.searchHistory.length) {
    const lastSearch = ctx.searchHistory[ctx.searchHistory.length - 1];
    parts.push(
      `Last search: ${JSON.stringify(lastSearch.params)} (${lastSearch.resultCount} results)`
    );
  }
  if (ctx.savedJobCount > 0) {
    parts.push(`User has saved ${ctx.savedJobCount} jobs`);
  }
  if (ctx.recentIntents.length) {
    parts.push(`Recent intents: ${ctx.recentIntents.join(', ')}`);
  }

  return parts.length ? `\n\nUser Context:\n${parts.join('\n')}` : '';
}

function deleteConversation(userId, sessionId) {
  const id = getConversationId(userId, sessionId);
  conversationStore.delete(id);
}

function getUserConversations(userId) {
  const conversations = [];
  for (const [id, conv] of conversationStore) {
    if (conv.userId === userId) {
      conversations.push({
        id: conv.sessionId,
        messageCount: conv.metadata.totalMessages,
        createdAt: conv.metadata.createdAt,
        lastActive: conv.metadata.lastActive,
      });
    }
  }
  return conversations.sort((a, b) => b.lastActive - a.lastActive);
}

module.exports = {
  createConversation,
  getConversation,
  addMessage,
  addSearchContext,
  addSavedJob,
  addViewedJob,
  getMemoryContext,
  buildMemoryPrompt,
  deleteConversation,
  getUserConversations,
};
