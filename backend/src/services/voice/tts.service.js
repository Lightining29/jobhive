/**
 * TTS Service — Kokoro-FastAPI (OpenAI-compatible /v1/audio/speech)
 *
 * Kokoro runs as a local FastAPI server (default port 8880).
 * Install:  pip install kokoro-onnx  OR  docker run ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2
 * Voices:   af_heart, af_sarah, af_bella, af_nicole, am_adam, am_michael,
 *           bf_emma, bf_isabella, bm_george, bm_lewis  (+ more via GET /v1/voices)
 *
 * Falls back silently when Kokoro is not running — the frontend uses
 * the browser's built-in Web Speech Synthesis in that case.
 *
 * v2: Enhanced for natural-sounding speech — improved text preprocessing,
 *     sentence-boundary chunking for streaming, and prosody-aware cleanup.
 */

const https = require('https');
const http = require('http');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';

const TTS_CONFIG = {
  baseUrl: process.env.KOKORO_URL || 'http://localhost:8880',
  voice: process.env.KOKORO_VOICE || 'af_heart',    // af_heart has most natural prosody
  speed: parseFloat(process.env.KOKORO_SPEED) || 0.95, // slightly slower = more natural
  format: process.env.KOKORO_FORMAT || 'mp3',
  timeout: parseInt(process.env.KOKORO_TIMEOUT, 10) || 20000,
  maxChunkSize: 400, // chars per chunk for streaming (Kokoro sweet spot)
};

// ── Abbreviation & acronym expansion for TTS ────────────────────────────────
const ABBREVIATIONS = {
  'mr.':    'Mister',
  'mrs.':   'Missus',
  'ms.':    'Miss',
  'dr.':    'Doctor',
  'prof.':  'Professor',
  'sr.':    'Senior',
  'jr.':    'Junior',
  'st.':    'Saint',
  'avg.':   'average',
  'dept.':  'department',
  'est.':   'established',
  'e.g.':   'for example',
  'i.e.':   'that is',
  'etc.':   'etcetera',
  'vs.':    'versus',
  'inc.':   'incorporated',
  'ltd.':   'limited',
  'corp.':  'corporation',
  'llc':    'L L C',
  'api':    'A P I',
  'apis':   'A P I s',
  'aws':    'A W S',
  'css':    'C S S',
  'html':   'H T M L',
  'sql':    'S Q L',
  'ui':     'user interface',
  'ux':     'user experience',
  'ci/cd':  'C I C D',
  'devops': 'dev ops',
  'json':   'J S O N',
  'rest':   'rest',
  'jwt':    'J W T',
  'npm':    'N P M',
  'git':    'git',
  'ios':    'eye oh ess',
  'mern':   'MERN',
  'oop':    'O O P',
  'oops':   'O O P s',
  'dsa':    'D S A',
  'ai':     'A I',
  'ml':     'machine learning',
  'nlp':    'N L P',
  'llm':    'L L M',
  'rag':    'R A G',
  'gcp':    'G C P',
  'hr':     'human resources',
  'hrms':   'H R M S',
  'erp':    'E R P',
  'cdn':    'C D N',
  'dns':    'D N S',
  'ssh':    'S S H',
  'http':   'H T T P',
  'https':  'H T T P S',
  'url':    'U R L',
  'urls':   'U R L s',
  'seo':    'S E O',
  'saas':   'SaaS',
  'paas':   'PaaS',
  'iaas':   'IaaS',
  'vm':     'virtual machine',
  'vms':    'virtual machines',
  'rbac':   'R B A C',
  'crud':   'crud',
  'grpc':   'g R P C',
  'mqtt':   'M Q T T',
  'k8s':    'Kubernetes',
};

// ── Number → words (for small numbers in speech context) ────────────────────
function numberToWords(num) {
  if (num >= 1000) return num.toLocaleString('en-US');
  const ones = ['','one','two','three','four','five','six','seven','eight','nine',
    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? '-' + ones[num%10] : '');
  return ones[Math.floor(num/100)] + ' hundred' + (num%100 ? ' and ' + numberToWords(num%100) : '');
}

// ── Enhanced text cleaning for natural TTS ──────────────────────────────────
function cleanText(text) {
  if (!text) return '';

  let cleaned = text
    // Strip markdown/code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // URLs → skip
    .replace(/https?:\/\/[^\s]+/g, '')
    // Emails → say "at"
    .replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z]+)/g, '$1 at $2')
    // Dollar amounts
    .replace(/\$[\d,]+\.?\d*/g, (m) => m.replace('$','') + ' dollars')
    // Percentages
    .replace(/(\d+)%/g, '$1 percent')
    // Dash-separated ranges
    .replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 to $2')
    // Bullet points → period
    .replace(/[•●○◦▪▸►→]+/g, '.')
    // Multiple newlines → sentence break
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Expand abbreviations (case-insensitive, word-boundary)
  for (const [abbr, expansion] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleaned = cleaned.replace(regex, expansion);
  }

  // Add natural pauses after sentence-ending punctuation
  cleaned = cleaned
    .replace(/([.!?])\s+/g, '$1 ')  // normalize spacing
    .replace(/([.!?])([A-Z])/g, '$1 $2')  // ensure space after sentence end

  // Trim to Kokoro's sweet spot (~500 tokens ≈ 1000 chars)
  return cleaned.slice(0, 1000);
}

/**
 * Split text into natural chunks for streaming TTS.
 * Splits at sentence boundaries to avoid mid-sentence breaks.
 */
function splitIntoChunks(text, maxChars = TTS_CONFIG.maxChunkSize) {
  if (!text || text.length <= maxChars) return [text || ''];

  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];

  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = '';
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text.slice(0, maxChars)];
}

// ── Gemini Voice / Google Cloud TTS synthesis ────────────────────────────────
async function geminiSynthesise(text, opts = {}) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const cleaned = cleanText(text);
  if (!cleaned) throw new Error('Empty text');

  const voiceName = opts.voice || process.env.GEMINI_VOICE || 'en-US-Journey-F';
  const languageCode = opts.lang || 'en-US';
  const speed = opts.speed || 1.0;

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`;
  const body = {
    input: { text: cleaned },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate: speed },
  };

  const { status, data } = await httpPostJSON(url, body, TTS_CONFIG.timeout);
  if (status !== 200 || !data?.audioContent) {
    throw new Error(`Gemini Voice error ${status}: ${data?.error?.message || 'No audioContent'}`);
  }

  const buffer = Buffer.from(data.audioContent, 'base64');
  return { buffer, contentType: 'audio/mpeg', format: 'mp3', provider: 'gemini-voice' };
}

/**
 * Check if TTS server is running.
 */
async function healthCheck() {
  if (GEMINI_API_KEY) {
    return {
      available: true,
      provider: 'gemini-voice',
      voices: ['en-US-Journey-F', 'en-US-Journey-D', 'en-US-Neural2-F', 'en-US-Neural2-D', 'en-US-Studio-O'],
      voice: process.env.GEMINI_VOICE || 'en-US-Journey-F',
      format: 'mp3',
    };
  }

  try {
    const url = `${TTS_CONFIG.baseUrl}/v1/voices`;
    const result = await httpGet(url, TTS_CONFIG.timeout);
    const voices = Array.isArray(result)
      ? result.map((v) => (typeof v === 'string' ? v : v.id || v.name))
      : [];
    return { available: true, voices, voice: TTS_CONFIG.voice, format: TTS_CONFIG.format };
  } catch {
    return { available: false, voices: [], voice: TTS_CONFIG.voice };
  }
}

/**
 * Synthesise text → audio buffer.
 * Enhanced with natural text preprocessing.
 */
async function synthesise(text, opts = {}) {
  if (GEMINI_API_KEY) {
    try {
      return await geminiSynthesise(text, opts);
    } catch (err) {
      console.warn('[TTS] Gemini Voice failed, falling back to Kokoro:', err.message);
    }
  }

  const voice = opts.voice || TTS_CONFIG.voice;
  const speed = opts.speed || TTS_CONFIG.speed;
  const format = opts.format || TTS_CONFIG.format;
  const cleaned = cleanText(text);

  const url = `${TTS_CONFIG.baseUrl}/v1/audio/speech`;
  const body = { model: 'kokoro', input: cleaned, voice, speed, response_format: format };

  const mimeMap = { mp3: 'audio/mpeg', wav: 'audio/wav', opus: 'audio/opus', flac: 'audio/flac', pcm: 'audio/pcm' };
  const contentType = mimeMap[format] || 'audio/mpeg';

  const buffer = await httpPostBinary(url, body, TTS_CONFIG.timeout);
  return { buffer, contentType, format };
}

/**
 * Stream audio directly into an HTTP response (chunked transfer).
 * Pipes response straight to the client — no buffering.
 */
async function stream(text, res, opts = {}) {
  if (GEMINI_API_KEY) {
    try {
      const { buffer, contentType } = await geminiSynthesise(text, opts);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.end(buffer);
      return;
    } catch (err) {
      console.warn('[TTS] Gemini Voice stream failed, falling back to Kokoro:', err.message);
    }
  }

  const voice = opts.voice || TTS_CONFIG.voice;
  const speed = opts.speed || TTS_CONFIG.speed;
  const format = opts.format || TTS_CONFIG.format;
  const cleaned = cleanText(text);

  const mimeMap = { mp3: 'audio/mpeg', wav: 'audio/wav', opus: 'audio/opus', flac: 'audio/flac' };
  const contentType = mimeMap[format] || 'audio/mpeg';

  const url = `${TTS_CONFIG.baseUrl}/v1/audio/speech`;
  const body = { model: 'kokoro', input: cleaned, voice, speed, response_format: format };

  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: TTS_CONFIG.timeout,
      },
      (kokoroRes) => {
        if (kokoroRes.statusCode !== 200) {
          reject(new Error(`Kokoro returned HTTP ${kokoroRes.statusCode}`));
          return;
        }
        kokoroRes.pipe(res);
        kokoroRes.on('end', resolve);
        kokoroRes.on('error', reject);
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Kokoro TTS request timed out')); });
    req.write(data);
    req.end();
  });
}

/**
 * Stream text in chunks for lower perceived latency.
 * Sends each sentence as a separate TTS request and streams back-to-back.
 * This gives the user audio faster for long responses.
 */
async function streamChunked(text, res, opts = {}) {
  const voice = opts.voice || TTS_CONFIG.voice;
  const speed = opts.speed || TTS_CONFIG.speed;
  const format = opts.format || TTS_CONFIG.format;

  const mimeMap = { mp3: 'audio/mpeg', wav: 'audio/wav', opus: 'audio/opus', flac: 'audio/flac' };
  const contentType = mimeMap[format] || 'audio/mpeg';

  const chunks = splitIntoChunks(text);
  if (chunks.length <= 1) {
    return stream(text, res, opts);
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  for (const chunk of chunks) {
    const cleaned = cleanText(chunk);
    if (!cleaned) continue;

    const url = `${TTS_CONFIG.baseUrl}/v1/audio/speech`;
    const body = { model: 'kokoro', input: cleaned, voice, speed, response_format: format };

    try {
      const buffer = await httpPostBinary(url, body, TTS_CONFIG.timeout);
      res.write(buffer);
    } catch (err) {
      // If one chunk fails, skip it and continue
      console.warn('[TTS] chunk failed:', err.message);
    }
  }

  res.end();
}

// ── Internal HTTP helpers ──────────────────────────────────────────────────

function httpGet(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.get(
      { hostname: parsed.hostname, port: parsed.port, path: parsed.pathname, timeout },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function httpPostBinary(url, body, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Kokoro TTS HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString().slice(0, 200)}`));
          } else {
            resolve(Buffer.concat(chunks));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Kokoro TTS timed out')); });
    req.write(data);
    req.end();
  });
}

function httpPostJSON(url, body, timeout = 15000) {
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
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout,
      },
      (res) => {
        let bodyStr = '';
        res.on('data', (c) => (bodyStr += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(bodyStr) });
          } catch {
            resolve({ status: res.statusCode, data: { raw: bodyStr } });
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('HTTP POST request timed out')); });
    req.write(data);
    req.end();
  });
}

module.exports = { synthesise, stream, streamChunked, healthCheck, splitIntoChunks, TTS_CONFIG, cleanText, geminiSynthesise };
