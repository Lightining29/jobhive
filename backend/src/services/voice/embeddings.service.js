const https = require('https');
const http = require('http');

const EMBEDDING_CONFIG = {
  baseUrl: process.env.EMBEDDING_URL || 'http://localhost:11434',
  model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
  dimension: parseInt(process.env.EMBEDDING_DIMENSION, 10) || 768,
  timeout: parseInt(process.env.EMBEDDING_TIMEOUT, 10) || 10000,
};

function httpPost(url, body, timeout = EMBEDDING_CONFIG.timeout) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
        timeout,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ embedding: [] });
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Embedding request timed out'));
    });
    req.write(data);
    req.end();
  });
}

async function generateEmbedding(text) {
  try {
    const url = `${EMBEDDING_CONFIG.baseUrl}/api/embed`;
    const result = await httpPost(url, {
      model: EMBEDDING_CONFIG.model,
      input: text,
    });
    return result.embeddings?.[0] || result.embedding || [];
  } catch {
    return generateFallbackEmbedding(text);
  }
}

async function generateEmbeddings(texts) {
  try {
    const url = `${EMBEDDING_CONFIG.baseUrl}/api/embed`;
    const result = await httpPost(url, {
      model: EMBEDDING_CONFIG.model,
      input: texts,
    });
    return result.embeddings || [];
  } catch {
    return texts.map((text) => generateFallbackEmbedding(text));
  }
}

function generateFallbackEmbedding(text) {
  const vector = new Array(EMBEDDING_CONFIG.dimension).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  words.forEach((word, i) => {
    const hash = simpleHash(word);
    const idx = Math.abs(hash) % EMBEDDING_CONFIG.dimension;
    vector[idx] += 1;
    const idx2 = Math.abs(hash * 31) % EMBEDDING_CONFIG.dimension;
    vector[idx2] += 0.5;
  });

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

function cosineSimilarity(a, b) {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function healthCheck() {
  try {
    const url = `${EMBEDDING_CONFIG.baseUrl}/api/tags`;
    const result = await httpPost(url, {}, 5000);
    const models = result.models || [];
    const hasEmbedding = models.some(
      (m) => m.name === EMBEDDING_CONFIG.model || m.name.includes('embed')
    );
    return {
      status: 'ok',
      available: true,
      model: EMBEDDING_CONFIG.model,
      hasModel: hasEmbedding,
      models: models.map((m) => m.name),
    };
  } catch {
    return {
      status: 'offline',
      available: false,
      model: EMBEDDING_CONFIG.model,
      hasModel: false,
    };
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  healthCheck,
  EMBEDDING_CONFIG,
};
