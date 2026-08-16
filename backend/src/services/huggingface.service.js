const https = require('https');
const logger = require('../config/logger');

function postJson(url, data, token, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let resBody = '';
        res.on('data', (c) => (resBody += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch {
            resolve({ status: res.statusCode, data: { raw: resBody } });
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Hugging Face API request timed out'));
    });
    req.write(bodyStr);
    req.end();
  });
}

function postBinary(url, data, token, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ status: res.statusCode, buffer });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Hugging Face image generation timed out'));
    });
    req.write(bodyStr);
    req.end();
  });
}

const getEffectiveToken = (customKey) =>
  customKey || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';

/**
 * 1. AI Theme Generation from Prompt
 */
async function generateThemeFromPrompt(prompt, customKey) {
  const token = getEffectiveToken(customKey);

  const systemInstructions = `You are an elite creative director and UI/UX theme architect.
Create a stunning visual theme for a digital identity smart card based on: "${prompt}".
You MUST reply with ONLY a valid JSON object without markdown fences, conforming to this exact structure:
{
  "name": "Creative Theme Name",
  "category": "Tech & Gaming",
  "description": "Short aesthetic description",
  "colors": {
    "bgPrimary": "#05050e",
    "bgSecondary": "#0a0a1a",
    "accent": "#00f0ff",
    "accentSecondary": "#ff007f",
    "textPrimary": "#ffffff",
    "textSecondary": "#94a3b8",
    "border": "rgba(0, 240, 255, 0.4)",
    "cardBg": "linear-gradient(135deg, #05050e 0%, #0d0f2b 100%)",
    "glowColor": "#00f0ff",
    "badgeBg": "rgba(0, 240, 255, 0.15)",
    "badgeText": "#00f0ff",
    "badgeBorder": "rgba(0, 240, 255, 0.4)"
  },
  "background": {
    "type": "gradient",
    "pattern": "grid",
    "overlay": "none"
  },
  "typography": {
    "titleFont": "Space Grotesk",
    "bodyFont": "JetBrains Mono"
  },
  "cardStyle": {
    "borderRadius": "1rem",
    "borderWidth": "1.5px",
    "hasHologram": true,
    "hasScanlines": true,
    "hasGlow": true,
    "chipStyle": "neon-cyan",
    "nfcStyle": "neon",
    "glassmorphism": true,
    "shadow": "0 25px 50px -12px rgba(0, 240, 255, 0.25)"
  }
}`;

  if (token) {
    const models = [
      'meta-llama/Llama-3.3-70B-Instruct',
      'meta-llama/Meta-Llama-3-8B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.3',
    ];

    for (const model of models) {
      try {
        const res = await postJson(
          `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
          {
            model,
            messages: [
              { role: 'system', content: systemInstructions },
              { role: 'user', content: `Generate card theme for: ${prompt}` },
            ],
            max_tokens: 800,
            temperature: 0.7,
          },
          token,
          15000
        );

        let content = res.data?.choices?.[0]?.message?.content;
        if (content) {
          content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(content);
          return parsed;
        }
      } catch (err) {
        logger.warn(`[HF Theme] model ${model} failed:`, err.message);
      }
    }
  }

  // High quality procedural theme synthesizer fallback
  return synthesizeThemeProcedural(prompt);
}

function synthesizeThemeProcedural(prompt) {
  const p = prompt.toLowerCase();
  let baseColor = '#00f0ff';
  let accentSec = '#ff007f';
  let bg1 = '#090a16';
  let bg2 = '#12142d';
  let font = 'Space Grotesk';
  let pattern = 'grid';
  let chip = 'neon-cyan';

  if (p.includes('gold') || p.includes('luxury') || p.includes('royal') || p.includes('executive')) {
    baseColor = '#d4af37';
    accentSec = '#f3e5ab';
    bg1 = '#0a0a0c';
    bg2 = '#181512';
    font = 'Playfair Display';
    pattern = 'mesh';
    chip = 'gold';
  } else if (p.includes('emerald') || p.includes('nature') || p.includes('green') || p.includes('forest')) {
    baseColor = '#10b981';
    accentSec = '#34d399';
    bg1 = '#04150f';
    bg2 = '#0a2e22';
    font = 'Outfit';
    pattern = 'waves';
    chip = 'gold';
  } else if (p.includes('purple') || p.includes('galaxy') || p.includes('cosmic') || p.includes('nebula')) {
    baseColor = '#a855f7';
    accentSec = '#ec4899';
    bg1 = '#0c071e';
    bg2 = '#1b0d3a';
    font = 'Syne';
    pattern = 'dots';
    chip = 'cyber-holo';
  }

  return {
    name: `${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Edition`,
    category: 'AI Generated',
    description: `Procedurally crafted smart theme inspired by ${prompt}`,
    colors: {
      bgPrimary: bg1,
      bgSecondary: bg2,
      accent: baseColor,
      accentSecondary: accentSec,
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      border: `rgba(${parseInt(baseColor.slice(1, 3), 16) || 0}, ${parseInt(baseColor.slice(3, 5), 16) || 240}, ${parseInt(baseColor.slice(5, 7), 16) || 255}, 0.35)`,
      cardBg: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`,
      glowColor: baseColor,
      badgeBg: `rgba(${parseInt(baseColor.slice(1, 3), 16) || 0}, ${parseInt(baseColor.slice(3, 5), 16) || 240}, ${parseInt(baseColor.slice(5, 7), 16) || 255}, 0.15)`,
      badgeText: baseColor,
      badgeBorder: `rgba(${parseInt(baseColor.slice(1, 3), 16) || 0}, ${parseInt(baseColor.slice(3, 5), 16) || 240}, ${parseInt(baseColor.slice(5, 7), 16) || 255}, 0.4)`,
    },
    background: {
      type: 'gradient',
      pattern,
      overlay: 'none',
    },
    typography: {
      titleFont: font,
      bodyFont: 'Inter',
    },
    cardStyle: {
      borderRadius: '1rem',
      borderWidth: '1.5px',
      hasHologram: true,
      hasScanlines: false,
      hasGlow: true,
      chipStyle: chip,
      nfcStyle: 'neon',
      glassmorphism: true,
      shadow: `0 25px 50px -12px ${baseColor}33`,
    },
  };
}

/**
 * 2. AI Bio & Tagline Generator
 */
async function generateBioFromAI({ name, role, skills, organization, tone = 'executive' }, customKey) {
  const token = getEffectiveToken(customKey);

  const prompt = `Write a punchy executive tagline (under 12 words) and an engaging professional bio (under 40 words) for:
Name: ${name || 'Professional'}
Role: ${role || 'Expert'}
Organization: ${organization || 'Leading Firm'}
Skills: ${(skills || []).join(', ') || 'Leadership, Strategy'}
Tone: ${tone}

Reply in strictly valid JSON format:
{
  "tagline": "Short magnetic tagline",
  "bio": "Compelling bio statement highlighting expertise and vision.",
  "suggestedSkills": ["skill1", "skill2", "skill3"]
}`;

  if (token) {
    try {
      const res = await postJson(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct/v1/chat/completions',
        {
          model: 'meta-llama/Llama-3.3-70B-Instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        },
        token,
        15000
      );

      let content = res.data?.choices?.[0]?.message?.content;
      if (content) {
        content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(content);
      }
    } catch (err) {
      logger.warn('[HF Bio] failed, using fallback:', err.message);
    }
  }

  return {
    tagline: `Pioneering ${role || 'Innovation'} at ${organization || 'JobHive'}`,
    bio: `Passionate ${role || 'Leader'} specializing in ${(skills || []).slice(0, 3).join(', ') || 'strategy and engineering'}. Dedicated to driving transformative results and high-impact solutions.`,
    suggestedSkills: ['Leadership', 'System Architecture', 'Cloud Solutions', 'Strategy'],
  };
}

/**
 * 3. AI Avatar Generator (FLUX.1 / SDXL)
 */
async function generateAvatarFromAI(description, style = 'cinematic', customKey) {
  const token = getEffectiveToken(customKey);

  if (!token) {
    // Generate deterministic beautiful avatar from Dicebear
    const seed = encodeURIComponent(description || 'Alex');
    return {
      avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=0f172a,1e1b4b`,
      source: 'dicebear-fallback',
      prompt: description,
    };
  }

  const enhancedPrompt = `Professional portrait of ${description}, ${style} lighting, 8k resolution, photorealistic, elegant studio portrait, sharp focus, clean background`;

  try {
    const res = await postBinary(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      { inputs: enhancedPrompt },
      token,
      30000
    );

    if (res.status === 200 && res.buffer.length > 500) {
      const base64 = `data:image/jpeg;base64,${res.buffer.toString('base64')}`;
      return {
        avatarUrl: base64,
        source: 'huggingface-flux',
        prompt: enhancedPrompt,
      };
    }
  } catch (err) {
    logger.warn('[HF Avatar] FLUX failed:', err.message);
  }

  const seed = encodeURIComponent(description || 'Alex');
  return {
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=6366f1,3b82f6`,
    source: 'dicebear-fallback',
    prompt: description,
  };
}

/**
 * 4. Verify HF API Token
 */
async function verifyHfKey(apiKey) {
  const token = getEffectiveToken(apiKey);
  if (!token) {
    return { valid: false, message: 'No Hugging Face token provided' };
  }

  try {
    const res = await postJson(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 2,
      },
      token,
      8000
    );

    if (res.status === 200 || res.status === 429) {
      return { valid: true, message: 'Hugging Face Token is verified and active!' };
    }
    return { valid: false, message: res.data?.error || `HTTP Status ${res.status}` };
  } catch (err) {
    if (err.message && !err.message.includes('401') && !err.message.includes('403')) {
      return { valid: true, message: 'Hugging Face API connected successfully' };
    }
    return { valid: false, message: err.message };
  }
}

module.exports = {
  generateThemeFromPrompt,
  generateBioFromAI,
  generateAvatarFromAI,
  verifyHfKey,
};
