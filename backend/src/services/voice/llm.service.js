/**
 * LLM Service — supports two providers:
 *
 *   1. Qwen API (cloud)  — used when QWEN_API_KEY is set in .env
 *      OpenAI-compatible endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1
 *
 *   2. Ollama (local)    — used when no API key is present
 *      Default: http://localhost:11434
 *
 * The provider is selected automatically at startup. No code changes needed
 * to switch — just set or unset QWEN_API_KEY in .env.
 */

const https = require('https');
const http = require('http');

// ── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';
const USE_GEMINI_API = Boolean(GEMINI_API_KEY);

const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const USE_QWEN_API = !USE_GEMINI_API && Boolean(QWEN_API_KEY);

const GEMINI_API_CONFIG = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS, 10) || 1024,
  temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.LLM_TOP_P) || 0.9,
  timeout: parseInt(process.env.LLM_TIMEOUT, 10) || 30000,
};

const QWEN_API_CONFIG = {
  baseUrl: process.env.QWEN_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: process.env.QWEN_API_MODEL || 'qwen-plus',          // qwen-turbo | qwen-plus | qwen-max
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS, 10) || 1024,
  temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.LLM_TOP_P) || 0.9,
  timeout: parseInt(process.env.LLM_TIMEOUT, 10) || 30000,
};

const OLLAMA_CONFIG = {
  baseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434',
  model: process.env.LLM_MODEL || 'qwen3:8b',
  fallbackModel: process.env.LLM_FALLBACK_MODEL || 'qwen3:4b',
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS, 10) || 2048,
  temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.LLM_TOP_P) || 0.9,
  timeout: parseInt(process.env.LLM_TIMEOUT, 10) || 30000,
};

// Export active config for health checks / controller inspection
const LLM_CONFIG = USE_GEMINI_API
  ? { ...GEMINI_API_CONFIG, provider: 'gemini-api' }
  : USE_QWEN_API
  ? { ...QWEN_API_CONFIG, provider: 'qwen-api' }
  : { ...OLLAMA_CONFIG, provider: 'ollama' };

// ── System prompt (shared by both providers) ────────────────────────────────

const SYSTEM_PROMPT = `You are JobHive AI, a concise career assistant inside a job portal chat widget.

Rules:
- Max 2 sentences per response. Never more.
- No markdown. No bullet points. No headers. Plain spoken text only.
- For job searches, state count + top result only.
- For salary, give one number range only.
- For advice, give one actionable tip only.
- Never repeat what the user said.
- Never say "I" more than once per response.
- If data is provided, use it. Never fabricate job listings.`;

// ── HTTP helpers ────────────────────────────────────────────────────────────

function httpPost(url, body, headers = {}, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
        timeout,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: { raw: body } });
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM request timed out'));
    });
    req.write(data);
    req.end();
  });
}

function httpStream(url, body, headers = {}, onToken, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
        timeout,
      },
      (res) => {
        let buffer = '';
        let fullResponse = '';

        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;

            // SSE format: "data: {...}"
            const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;

            try {
              const parsed = JSON.parse(jsonStr);

              // ── Qwen API / OpenAI-compatible SSE ────────────────────────
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullResponse += delta;
                onToken(delta);
              }

              // ── Ollama NDJSON ────────────────────────────────────────────
              const ollamaToken = parsed.message?.content;
              if (ollamaToken) {
                fullResponse += ollamaToken;
                onToken(ollamaToken);
              }

              if (parsed.done === true) {
                resolve(fullResponse);
              }
            } catch {
              // skip malformed lines
            }
          }
        });

        res.on('end', () => {
          // Flush remaining buffer
          if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
            const jsonStr = buffer.trim().startsWith('data: ')
              ? buffer.trim().slice(6)
              : buffer.trim();
            try {
              const parsed = JSON.parse(jsonStr);
              const delta =
                parsed.choices?.[0]?.delta?.content || parsed.message?.content || '';
              if (delta) {
                fullResponse += delta;
                onToken(delta);
              }
            } catch {
              // skip
            }
          }
          resolve(fullResponse);
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM streaming request timed out'));
    });
    req.write(data);
    req.end();
  });
}

// ── Gemini API (OpenAI-compatible) ──────────────────────────────────────────

function buildGeminiPayload(messages, options = {}) {
  return {
    model: options.model || GEMINI_API_CONFIG.model,
    messages: [{ role: 'system', content: options.systemPrompt || SYSTEM_PROMPT }, ...messages],
    stream: options.stream !== false,
    max_tokens: options.maxTokens || GEMINI_API_CONFIG.maxTokens,
    temperature: options.temperature ?? GEMINI_API_CONFIG.temperature,
  };
}

function geminiHeaders() {
  return { Authorization: `Bearer ${GEMINI_API_KEY}` };
}

async function geminiGenerate(messages, options = {}) {
  const url = `${GEMINI_API_CONFIG.baseUrl}/chat/completions`;
  const payload = buildGeminiPayload(messages, { ...options, stream: false });
  const { status, data } = await httpPost(url, payload, geminiHeaders(), options.timeout || GEMINI_API_CONFIG.timeout);

  if (status !== 200) {
    throw new Error(`Gemini API error ${status}: ${data?.error?.message || JSON.stringify(data)}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

async function geminiStream(messages, onToken, options = {}) {
  const url = `${GEMINI_API_CONFIG.baseUrl}/chat/completions`;
  const payload = buildGeminiPayload(messages, { ...options, stream: true });
  return httpStream(url, payload, geminiHeaders(), onToken, options.timeout || GEMINI_API_CONFIG.timeout);
}

async function geminiHealthCheck() {
  try {
    const url = `${GEMINI_API_CONFIG.baseUrl}/chat/completions`;
    const payload = {
      model: GEMINI_API_CONFIG.model,
      messages: [{ role: 'user', content: 'ping' }],
      stream: false,
      max_tokens: 5,
    };
    const { status, data } = await httpPost(url, payload, geminiHeaders(), 8000);
    if (status === 200) {
      return { status: 'ok', available: true, provider: 'gemini-api', model: GEMINI_API_CONFIG.model };
    }
    return {
      status: 'error',
      available: false,
      provider: 'gemini-api',
      model: GEMINI_API_CONFIG.model,
      error: data?.error?.message || `HTTP ${status}`,
    };
  } catch (err) {
    return {
      status: 'offline',
      available: false,
      provider: 'gemini-api',
      model: GEMINI_API_CONFIG.model,
      error: err.message,
    };
  }
}

// ── Qwen API (OpenAI-compatible) ────────────────────────────────────────────

function buildQwenPayload(messages, options = {}) {
  return {
    model: options.model || QWEN_API_CONFIG.model,
    messages: [{ role: 'system', content: options.systemPrompt || SYSTEM_PROMPT }, ...messages],
    stream: options.stream !== false,
    max_tokens: options.maxTokens || QWEN_API_CONFIG.maxTokens,
    temperature: options.temperature ?? QWEN_API_CONFIG.temperature,
    top_p: options.topP ?? QWEN_API_CONFIG.topP,
  };
}

function qwenHeaders() {
  return { Authorization: `Bearer ${QWEN_API_KEY}` };
}

async function qwenGenerate(messages, options = {}) {
  const url = `${QWEN_API_CONFIG.baseUrl}/chat/completions`;
  const payload = buildQwenPayload(messages, { ...options, stream: false });
  const { status, data } = await httpPost(url, payload, qwenHeaders(), options.timeout || QWEN_API_CONFIG.timeout);

  if (status !== 200) {
    throw new Error(`Qwen API error ${status}: ${data?.error?.message || JSON.stringify(data)}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

async function qwenStream(messages, onToken, options = {}) {
  const url = `${QWEN_API_CONFIG.baseUrl}/chat/completions`;
  const payload = buildQwenPayload(messages, { ...options, stream: true });
  return httpStream(url, payload, qwenHeaders(), onToken, options.timeout || QWEN_API_CONFIG.timeout);
}

async function qwenHealthCheck() {
  try {
    // A minimal non-streaming request to verify the key works
    const url = `${QWEN_API_CONFIG.baseUrl}/chat/completions`;
    const payload = {
      model: QWEN_API_CONFIG.model,
      messages: [{ role: 'user', content: 'ping' }],
      stream: false,
      max_tokens: 5,
    };
    const { status, data } = await httpPost(url, payload, qwenHeaders(), 8000);
    if (status === 200) {
      return { status: 'ok', available: true, provider: 'qwen-api', model: QWEN_API_CONFIG.model };
    }
    return {
      status: 'error',
      available: false,
      provider: 'qwen-api',
      model: QWEN_API_CONFIG.model,
      error: data?.error?.message || `HTTP ${status}`,
    };
  } catch (err) {
    return {
      status: 'offline',
      available: false,
      provider: 'qwen-api',
      model: QWEN_API_CONFIG.model,
      error: err.message,
    };
  }
}

// ── Ollama ──────────────────────────────────────────────────────────────────

function buildOllamaPayload(messages, options = {}) {
  return {
    model: options.model || OLLAMA_CONFIG.model,
    messages: [{ role: 'system', content: options.systemPrompt || SYSTEM_PROMPT }, ...messages],
    stream: options.stream !== false,
    options: {
      num_predict: options.maxTokens || OLLAMA_CONFIG.maxTokens,
      temperature: options.temperature ?? OLLAMA_CONFIG.temperature,
      top_p: options.topP ?? OLLAMA_CONFIG.topP,
    },
  };
}

async function ollamaGenerate(messages, options = {}) {
  const url = `${OLLAMA_CONFIG.baseUrl}/api/chat`;
  const payload = buildOllamaPayload(messages, { ...options, stream: false });
  const { status, data } = await httpPost(url, payload, {}, options.timeout || OLLAMA_CONFIG.timeout);

  if (status !== 200) {
    throw new Error(`Ollama error ${status}: ${data?.error || JSON.stringify(data)}`);
  }

  return data.message?.content || data.response || '';
}

async function ollamaStream(messages, onToken, options = {}) {
  const url = `${OLLAMA_CONFIG.baseUrl}/api/chat`;
  const payload = buildOllamaPayload(messages, { ...options, stream: true });
  return httpStream(url, payload, {}, onToken, options.timeout || OLLAMA_CONFIG.timeout);
}

async function ollamaHealthCheck() {
  try {
    const url = `${OLLAMA_CONFIG.baseUrl}/api/tags`;
    const { status, data } = await httpPost(url, {}, {}, 5000);
    if (status !== 200) throw new Error(`HTTP ${status}`);
    const models = data.models || [];
    const hasModel = models.some(
      (m) => m.name === OLLAMA_CONFIG.model || m.name.startsWith('qwen')
    );
    return {
      status: 'ok',
      available: true,
      provider: 'ollama',
      model: OLLAMA_CONFIG.model,
      hasModel,
      models: models.map((m) => m.name),
    };
  } catch (err) {
    return {
      status: 'offline',
      available: false,
      provider: 'ollama',
      model: OLLAMA_CONFIG.model,
      hasModel: false,
      models: [],
      error: err.message,
    };
  }
}

// ── Public API — delegates to active provider ────────────────────────────────

async function generateResponse(messages, options = {}) {
  if (USE_GEMINI_API) return geminiGenerate(messages, options);
  if (USE_QWEN_API)   return qwenGenerate(messages, options);
  return ollamaGenerate(messages, options);
}

async function generateStreamingResponse(messages, onToken, options = {}) {
  if (USE_GEMINI_API) return geminiStream(messages, onToken, options);
  if (USE_QWEN_API)   return qwenStream(messages, onToken, options);
  return ollamaStream(messages, onToken, options);
}

async function generateWithFallback(messages, options = {}) {
  try {
    return await generateResponse(messages, options);
  } catch (err) {
    // If using Ollama, try the fallback model
    if (!USE_GEMINI_API && !USE_QWEN_API && options.model !== OLLAMA_CONFIG.fallbackModel) {
      try {
        return await ollamaGenerate(messages, {
          ...options,
          model: OLLAMA_CONFIG.fallbackModel,
        });
      } catch {
        // fall through to hardcoded response
      }
    }
    return generateFallbackResponse(messages);
  }
}

async function healthCheck() {
  if (USE_GEMINI_API) return geminiHealthCheck();
  if (USE_QWEN_API)   return qwenHealthCheck();
  return ollamaHealthCheck();
}

function generateFallbackResponse(messages) {
  const lastMsg = messages[messages.length - 1];
  const content = (lastMsg?.content || '').toLowerCase();

  if (content.includes('hello') || content.includes('hi') || content.includes('hey'))
    return "Hello! Ask me to find jobs, check salaries, or prep for interviews.";
  if (content.includes('job') || content.includes('find') || content.includes('search'))
    return "Try asking 'find React jobs in Bangalore' and I'll search the live database.";
  if (content.includes('salary') || content.includes('pay'))
    return "Ask 'salary for [role] in [city]' for real figures from live listings.";
  if (content.includes('interview') || content.includes('prepare'))
    return "Prepare STAR-format answers and research the company before your interview.";
  if (content.includes('resume') || content.includes('cv'))
    return "Open the Resume Hub to build your resume or check your ATS score.";
  if (content.includes('build') && content.includes('resume'))
    return "Open the Resume Hub — AI Builder tab — to generate your resume automatically.";
  return "Ask me to find jobs, check salaries, build your resume, or prep for interviews.";
}

module.exports = {
  generateResponse,
  generateStreamingResponse,
  generateWithFallback,
  healthCheck,
  generateFallbackResponse,
  LLM_CONFIG,
  SYSTEM_PROMPT,
  USE_GEMINI_API,
  USE_QWEN_API,
};
