/**
 * Voice AI REST routes (complement to Socket.IO real-time channel).
 */
const router = require('express').Router();
const { protect, optionalProtect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const voiceController = require('../controllers/voice.controller');

// ── TTS rate limiter — 60 requests / minute (audio is heavier) ───────────────
const expressRateLimit = require('express-rate-limit');
const ttsLimiter = expressRateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many TTS requests, slow down.' },
});

// Health check — no auth
router.get('/health', voiceController.health);

// Kokoro TTS proxy — streams audio back to browser
// optionalProtect so guests can also use TTS
router.post('/tts', optionalProtect, ttsLimiter, voiceController.tts);

// Available Kokoro voices list
router.get('/tts/voices', voiceController.ttsVoices);

// Conversation history
router.get('/history', protect, voiceController.getHistory);
router.delete('/history', protect, voiceController.clearHistory);

// REST chat fallback
router.post('/chat', optionalProtect, apiLimiter, voiceController.chat);

// AI profile fill — extract structured data from natural language description
router.post('/ai-fill-profile', protect, apiLimiter, voiceController.aiFillProfile);

// AI Resume Builder — generate resume from profile
router.post('/resume/build', protect, apiLimiter, voiceController.resumeBuild);

// AI Resume PDF — download ATS-optimised PDF
router.post('/resume/pdf', protect, apiLimiter, voiceController.resumePdf);

// AI ATS Optimizer — score profile against job description
router.post('/resume/ats', protect, apiLimiter, voiceController.resumeATS);

module.exports = router;
