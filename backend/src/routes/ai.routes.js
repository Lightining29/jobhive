const express = require('express');
const router = express.Router();
const {
  generateThemeFromPrompt,
  generateBioFromAI,
  generateAvatarFromAI,
  verifyHfKey,
} = require('../services/huggingface.service');
const logger = require('../config/logger');

// ── POST /api/ai/theme - Generate theme from prompt using Hugging Face ─────────
router.post('/theme', async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const result = await generateThemeFromPrompt(prompt, apiKey);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('AI Theme Route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/ai/bio - Generate smart Bio & Taglines ──────────────────────────
router.post('/bio', async (req, res) => {
  try {
    const { name, role, skills, organization, tone, apiKey } = req.body;
    const result = await generateBioFromAI({ name, role, skills, organization, tone }, apiKey);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('AI Bio Route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/ai/avatar - Generate Avatar using Hugging Face Text-to-Image ─────
router.post('/avatar', async (req, res) => {
  try {
    const { prompt, style = 'cinematic', apiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Avatar description prompt is required' });
    }

    const result = await generateAvatarFromAI(prompt, style, apiKey);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('AI Avatar Route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/ai/verify-key - Test Hugging Face API key validity ───────────────
router.post('/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await verifyHfKey(apiKey);
    res.json({
      success: result.valid,
      ...result,
    });
  } catch (error) {
    res.json({
      success: false,
      valid: false,
      message: error.message,
    });
  }
});

module.exports = router;
