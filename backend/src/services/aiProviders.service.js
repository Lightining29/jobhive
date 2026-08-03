/**
 * aiProviders.service.js
 *
 * Unified AI provider layer used by portfolioGenerator, careerNews, and resumeAnalyzer.
 * Priority order:
 *   1. OpenRouter  (OPENROUTER_API_KEY)  — primary, works with free models
 *   2. Qwen API    (QWEN_API_KEY)        — cloud fallback
 *   3. Ollama      (LLM_BASE_URL)        — local fallback
 *
 * HuggingFace is used separately for grammar correction only.
 * Each function falls through to the next available provider automatically.
 */

const https = require('https');
const http  = require('http');
const logger = require('../config/logger');

// ── Credentials (lazy-read so tests can override process.env) ─────────────
const getConfig = () => ({
  gemini: {
    key:   process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL   || 'gemini-1.5-flash',
    base:  'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  openrouter: {
    key:   process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL   || 'google/gemma-4-26b-a4b-it:free',
    base:  'https://openrouter.ai/api/v1',
  },
  huggingface: {
    key:  process.env.HUGGINGFACE_API_KEY || '',
    base: 'https://api-inference.huggingface.co/models',
  },
  qwen: {
    key:   process.env.QWEN_API_KEY      || '',
    model: process.env.QWEN_API_MODEL    || 'qwen-plus',
    base:  process.env.QWEN_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  ollama: {
    base:  process.env.LLM_BASE_URL      || 'http://localhost:11434',
    model: process.env.LLM_MODEL         || 'qwen3:8b',
  },
  maxTokens:   parseInt(process.env.LLM_MAX_TOKENS, 10) || 1024,
  temperature: parseFloat(process.env.LLM_TEMPERATURE)  || 0.3,
  timeout:     parseInt(process.env.LLM_TIMEOUT, 10)    || 30000,
});

// ── HTTP POST helper ──────────────────────────────────────────────────────
function httpsPost(url, body, headers = {}, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsed    = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data      = JSON.stringify(body);
    const req = transport.request({
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + (parsed.search || ''),
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
      timeout,
    }, (res) => {
      let buf = '';
      res.on('data', c => (buf += c));
      res.on('end',  () => { try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); } catch { resolve({ status: res.statusCode, data: { raw: buf } }); } });
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.write(data);
    req.end();
  });
}

// ── Extract JSON from LLM response text ──────────────────────────────────
function extractJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/gim, '').replace(/```$/gim, '').trim();
  const start   = cleaned.indexOf('{');
  const end     = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

// ── Gemini chat completion ────────────────────────────────────────────────
async function geminiChat(systemPrompt, userMessage, maxTokens) {
  const cfg = getConfig();
  if (!cfg.gemini.key) throw new Error('GEMINI_API_KEY not set');

  const modelsToTry = Array.from(new Set([
    cfg.gemini.model,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ])).filter(Boolean);

  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      const { status, data } = await httpsPost(
        `${cfg.gemini.base}/chat/completions`,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage  },
          ],
          max_tokens:  Math.min(maxTokens || cfg.maxTokens, 8192),
          temperature: cfg.temperature,
        },
        { Authorization: `Bearer ${cfg.gemini.key}` },
        cfg.timeout
      );

      if (status === 200 && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      lastErr = new Error(`Gemini (${model}) HTTP ${status}: ${data?.error?.message || JSON.stringify(data).slice(0, 100)}`);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('Gemini API call failed');
}

// ── OpenRouter chat completion ────────────────────────────────────────────
async function openRouterChat(systemPrompt, userMessage, maxTokens) {
  const cfg = getConfig();
  if (!cfg.openrouter.key) throw new Error('OPENROUTER_API_KEY not set');

  const { status, data } = await httpsPost(
    `${cfg.openrouter.base}/chat/completions`,
    {
      model: cfg.openrouter.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens:  maxTokens || cfg.maxTokens,
      temperature: cfg.temperature,
    },
    {
      Authorization: `Bearer ${cfg.openrouter.key}`,
      'HTTP-Referer': 'https://jobhive.app',
      'X-Title': 'JobHive AI',
    },
    cfg.timeout
  );

  if (status !== 200) throw new Error(`OpenRouter HTTP ${status}: ${data?.error?.message || JSON.stringify(data).slice(0, 100)}`);
  return data.choices?.[0]?.message?.content || '';
}

// ── HuggingFace text generation (for grammar correction) ─────────────────
async function huggingFaceGenerate(model, inputs, maxTokens) {
  const cfg = getConfig();
  if (!cfg.huggingface.key) throw new Error('HUGGINGFACE_API_KEY not set');

  const { status, data } = await httpsPost(
    `${cfg.huggingface.base}/${model}`,
    { inputs, parameters: { max_new_tokens: maxTokens || 512, temperature: cfg.temperature } },
    { Authorization: `Bearer ${cfg.huggingface.key}` },
    20000
  );

  if (status !== 200) throw new Error(`HuggingFace HTTP ${status}`);
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (data?.generated_text) return data.generated_text;
  return '';
}

// ── Qwen chat completion ──────────────────────────────────────────────────
async function qwenChat(systemPrompt, userMessage, maxTokens) {
  const cfg = getConfig();
  if (!cfg.qwen.key) throw new Error('QWEN_API_KEY not set');

  const { status, data } = await httpsPost(
    `${cfg.qwen.base}/chat/completions`,
    {
      model: cfg.qwen.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens:  maxTokens || cfg.maxTokens,
      temperature: cfg.temperature,
      stream: false,
    },
    { Authorization: `Bearer ${cfg.qwen.key}` },
    cfg.timeout
  );

  if (status !== 200) throw new Error(`Qwen HTTP ${status}: ${data?.error?.message || ''}`);
  return data.choices?.[0]?.message?.content || '';
}

// ── Ollama chat completion ────────────────────────────────────────────────
async function ollamaChat(systemPrompt, userMessage, maxTokens) {
  const cfg = getConfig();
  const { status, data } = await httpsPost(
    `${cfg.ollama.base}/api/chat`,
    {
      model: cfg.ollama.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      stream: false,
      options: { num_predict: maxTokens || cfg.maxTokens, temperature: cfg.temperature },
    },
    {},
    cfg.timeout
  );
  if (status !== 200) throw new Error(`Ollama HTTP ${status}`);
  return data.message?.content || '';
}

// ── Primary export: chat with JSON output ─────────────────────────────────
/**
 * Generate a response from the best available provider.
 * Tries OpenRouter → Qwen → Ollama in order.
 * Returns parsed JSON object or null.
 */
async function generateJSON(systemPrompt, userMessage, maxTokens = 800) {
  const cfg = getConfig();
  const providers = [];

  if (cfg.gemini.key)     providers.push({ name: 'Gemini',     fn: () => geminiChat(systemPrompt, userMessage, maxTokens) });
  if (cfg.openrouter.key) providers.push({ name: 'OpenRouter', fn: () => openRouterChat(systemPrompt, userMessage, maxTokens) });
  if (cfg.qwen.key)       providers.push({ name: 'Qwen',       fn: () => qwenChat(systemPrompt, userMessage, maxTokens) });
  providers.push({ name: 'Ollama', fn: () => ollamaChat(systemPrompt, userMessage, maxTokens) });

  for (const provider of providers) {
    try {
      const text   = await provider.fn();
      const parsed = extractJSON(text);
      if (parsed) {
        logger.info(`[aiProviders] ${provider.name} succeeded`);
        return parsed;
      }
      logger.warn(`[aiProviders] ${provider.name} returned non-JSON`, { text: text.slice(0, 100) });
    } catch (err) {
      logger.warn(`[aiProviders] ${provider.name} failed`, { message: err.message });
    }
  }

  return null; // all providers failed
}

/**
 * Grammar correction via HuggingFace (falls back to null if key missing).
 */
async function grammarCorrect(text) {
  try {
    const result = await huggingFaceGenerate('vennify/t5-base-grammar-correction', text, 256);
    return result || null;
  } catch (err) {
    logger.warn('[aiProviders] HuggingFace grammar failed', { message: err.message });
    return null;
  }
}

module.exports = { generateJSON, grammarCorrect, geminiChat, openRouterChat, qwenChat };
