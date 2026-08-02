/**
 * Voice AI REST controller.
 * Provides health, conversation history, REST chat fallback, and Kokoro TTS proxy.
 */
const asyncHandler = require('../utils/asyncHandler');
const llmService = require('../services/voice/llm.service');
const embeddingService = require('../services/voice/embeddings.service');
const memoryService = require('../services/voice/memory.service');
const intentService = require('../services/voice/intent.service');
const jobSearchService = require('../services/voice/jobSearch.service');
const ttsService = require('../services/voice/tts.service');
const { extractProfileFromText } = require('../services/voice/profileExtractor.service');
const { buildResume, scoreATS } = require('../services/voice/resumeAI.service');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/voice/health
 * Returns status of LLM, embedding, and TTS services.
 */
const health = asyncHandler(async (req, res) => {
  const [llm, embedding, tts] = await Promise.allSettled([
    llmService.healthCheck(),
    embeddingService.healthCheck(),
    ttsService.healthCheck(),
  ]);

  res.json({
    success: true,
    services: {
      llm: llm.status === 'fulfilled' ? llm.value : { status: 'error', available: false },
      embedding: embedding.status === 'fulfilled' ? embedding.value : { status: 'error', available: false },
      tts: tts.status === 'fulfilled' ? tts.value : { status: 'error', available: false },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/voice/tts
 * Proxy to Kokoro TTS. Streams audio back to the client.
 * Body: { text: string, voice?: string, speed?: number, format?: string }
 *
 * The browser fetches this endpoint and plays the returned audio blob.
 */
const tts = asyncHandler(async (req, res) => {
  const { text, voice, speed, format } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'text is required.');
  }

  if (text.trim().length > 2000) {
    throw new ApiError(400, 'text must be 2000 characters or fewer.');
  }

  // Validate optional params
  const safeVoice = typeof voice === 'string' && /^[a-z0-9_]+$/.test(voice) ? voice : undefined;
  const safeSpeed = typeof speed === 'number' && speed >= 0.5 && speed <= 2.0 ? speed : undefined;
  const allowedFormats = ['mp3', 'wav', 'opus', 'flac'];
  const safeFormat = allowedFormats.includes(format) ? format : undefined;

  try {
    const cleaned = ttsService.cleanText(text.trim());
    // Use chunked streaming for long text (lower perceived latency)
    if (cleaned.length > 200) {
      await ttsService.streamChunked(cleaned, res, {
        voice: safeVoice,
        speed: safeSpeed,
        format: safeFormat,
      });
    } else {
      // Short text — single request is faster
      await ttsService.stream(cleaned, res, {
        voice: safeVoice,
        speed: safeSpeed,
        format: safeFormat,
      });
    }
  } catch (err) {
    // Kokoro is offline — tell the frontend to fall back to browser TTS
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Kokoro TTS is not available. Using browser TTS.',
        fallback: true,
      });
    }
  }
});

/**
 * GET /api/voice/tts/voices
 * Returns available Kokoro voices.
 */
const ttsVoices = asyncHandler(async (req, res) => {
  const result = await ttsService.healthCheck();
  res.json({
    success: true,
    available: result.available,
    voices: result.voices || [],
    defaultVoice: ttsService.TTS_CONFIG.voice,
  });
});

/**
 * GET /api/voice/history
 */
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const conversations = memoryService.getUserConversations(userId);
  res.json({ success: true, conversations });
});

/**
 * DELETE /api/voice/history
 */
const clearHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { sessionId } = req.query;

  if (sessionId) {
    memoryService.deleteConversation(userId, sessionId);
  } else {
    const convs = memoryService.getUserConversations(userId);
    convs.forEach((c) => memoryService.deleteConversation(userId, c.id));
  }

  res.json({ success: true, message: 'Conversation history cleared.' });
});

/**
 * POST /api/voice/chat
 * REST fallback for environments without WebSocket.
 */
const chat = asyncHandler(async (req, res) => {
  const { text, sessionId = 'rest' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'Message text is required.');
  }

  const sanitised = text.trim().slice(0, 500);
  const userId = req.user?._id?.toString() || req.ip;
  const user = req.user || null;

  memoryService.addMessage(userId, sessionId, 'user', sanitised);

  const { intent, entities } = intentService.detectIntent(sanitised);
  const memCtx = memoryService.getMemoryContext(userId, sessionId);
  const memPrompt = memoryService.buildMemoryPrompt(userId, sessionId);

  const history = memCtx.recentMessages
    .slice(-6)
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  let contextData = null;

  if (intent === 'job_search' || intent === 'recommendation') {
    const lastSearch = memCtx.searchHistory[memCtx.searchHistory.length - 1]?.params || {};
    const query = intentService.buildSearchQuery(intent, entities, { lastSearch });
    const results = await jobSearchService.searchJobs(query, user);
    memoryService.addSearchContext(userId, sessionId, query, results);
    contextData = { type: 'jobs', jobs: results.jobs.slice(0, 5), total: results.total };
  }

  const parts = [];
  if (memPrompt) parts.push(memPrompt);
  if (contextData?.jobs?.length) {
    const jobLines = contextData.jobs.map((j, i) => `${i + 1}. "${j.jobTitle}" at ${j.companyName}`).join('\n');
    parts.push(`\nLive job data (${contextData.total} total):\n${jobLines}`);
  }
  parts.push(`\nUser: "${sanitised}"`);

  const responseText = await llmService.generateWithFallback(
    [...history, { role: 'user', content: parts.join('') }],
    { maxTokens: 120 }
  );

  memoryService.addMessage(userId, sessionId, 'assistant', responseText, { intent });

  res.json({ success: true, response: responseText, intent, jobs: contextData?.jobs, total: contextData?.total });
});

/**
 * POST /api/voice/ai-fill-profile
 * Accepts a natural language description, extracts structured profile fields,
 * returns them as JSON for the frontend to populate the form.
 * Body: { text: string }
 */
const aiFillProfile = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'text is required.');
  }
  if (text.trim().length < 10) {
    throw new ApiError(400, 'Please describe yourself in more detail.');
  }

  const existing = req.user ? {
    name:     req.user.name,
    headline: req.user.headline,
    skills:   req.user.skills,
  } : {};

  const extracted = await extractProfileFromText(text.trim(), existing);

  res.json({ success: true, profile: extracted });
});

/**
 * POST /api/voice/resume/build
 * Generates a polished resume from the user's profile data.
 */
const resumeBuild = asyncHandler(async (req, res) => {
  const user = await require('../models/User').findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'User not found.');

  const resume = await buildResume(user);
  res.json({ success: true, resume });
});

/**
 * POST /api/voice/resume/pdf
 * Generates + streams an ATS-optimised PDF of the user's resume.
 * Body (optional): { resume: <pre-generated resume object> }
 * If no resume object is sent, it generates one first.
 */
const resumePdf = asyncHandler(async (req, res) => {
  const user = await require('../models/User').findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'User not found.');

  // Use resume from body if provided (avoids double AI call), else generate
  let resume = req.body?.resume || null;
  if (!resume || typeof resume !== 'object') {
    resume = await buildResume(user);
  }

  const template = ['classic', 'modern'].includes(req.body?.template) ? req.body.template : 'classic';

  const { generateResumePdf } = require('../services/resumePdfGenerator.service');
  const pdfBuffer = await generateResumePdf(resume, user, template);

  const safeName = (user.name || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}-resume.pdf"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  res.send(pdfBuffer);
});

/**
 * POST /api/voice/resume/ats
 * Scores the user's profile against a job description.
 * Body: { jobDescription: string }
 */
const resumeATS = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
    throw new ApiError(400, 'Please provide a job description (minimum 20 characters).');
  }
  if (jobDescription.length > 8000) {
    throw new ApiError(400, 'Job description too long (max 8000 characters).');
  }

  const user = await require('../models/User').findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'User not found.');

  const result = await scoreATS(user, jobDescription);
  res.json({ success: true, ...result });
});

module.exports = { health, tts, ttsVoices, getHistory, clearHistory, chat, aiFillProfile, resumeBuild, resumeATS, resumePdf };
