const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // Public base URL for served portfolios.
  // On Render: set BASE_URL=https://your-backend.onrender.com
  baseUrl: (process.env.BASE_URL || process.env.CLIENT_URL || 'http://localhost:5000')
    .replace(':5173', ':5000')
    .replace(/\/$/, ''),
  // Wildcard subdomain support: set to your apex domain e.g. "mydomain.com"
  // then https://{slug}.mydomain.com will serve the same portfolio as /p/{slug}
  appDomain: (process.env.APP_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(),

  mongoUri: process.env.MONGO_URI || 'mongodb://brayw433:Manish333@cluster0-shard-00-00.gmw98.mongodb.net:27017,cluster0-shard-00-01.gmw98.mongodb.net:27017,cluster0-shard-00-02.gmw98.mongodb.net:27017/jobportal?ssl=true&authSource=admin',

  jwt: {
    secret: process.env.JWT_SECRET || 'jobhive-production-super-secure-jwt-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free',
  },

  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
  },

  qwen: {
    apiKey: process.env.QWEN_API_KEY || '',
    baseUrl: process.env.QWEN_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.QWEN_API_MODEL || 'qwen-plus',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM_EMAIL || 'no-reply@jobhive.app',
    senderName: process.env.BREVO_SENDER_NAME || 'JobHive',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Job Hive <no-reply@jobhive.app>',
    dev: process.env.MAIL_DEV !== 'false',
  },

  jobApis: {
    jooble: {
      enabled: process.env.JOOBLE_ENABLED !== 'false',
      key: process.env.JOOBLE_API_KEY || 'b56e5dd0-0418-4885-9c1f-76825931979c',
      baseUrl: 'https://jooble.org/api',
    },
    adzuna: {
      enabled: process.env.ADZUNA_ENABLED !== 'false',
      appId: process.env.ADZUNA_APP_ID || '207ce3d5',
      appKey: process.env.ADZUNA_APP_KEY || '4051f3bb9a266fed3595355d09865234',
      country: process.env.ADZUNA_COUNTRY || 'gb',
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
    },
    arbeitnow: { enabled: process.env.ARBEITNOW_ENABLED !== 'false' },
    remotive: { enabled: process.env.REMOTIVE_ENABLED !== 'false' },
    muse: { enabled: process.env.MUSE_ENABLED !== 'false' },
    himalayas: { enabled: process.env.HIMALAYAS_ENABLED !== 'false' },
    jobicy: { enabled: process.env.JOBICY_ENABLED !== 'false' },
    greenhouse: {
      enabled: process.env.GREENHOUSE_ENABLED !== 'false',
      companies: (process.env.GREENHOUSE_COMPANIES || 'airbnb,reddit,instacart,duolingo,stripe,dropbox,coinbase,datadog,mongodb,cloudflare,databricks,roblox,intercom,airtable,squarespace,tcs,spacex,phonepe,groww,twilio,gitlab,figma,brex,mercury,elastic,epicgames,riotgames,pinterest,vercel,newrelic,smartsheet,asana')
        .split(',').map((s) => s.trim()).filter(Boolean),
    },
    amazon: { enabled: process.env.AMAZON_ENABLED !== 'false' },
    ashby: {
      enabled: process.env.ASHBY_ENABLED !== 'false',
      companies: (process.env.ASHBY_COMPANIES || 'notion,linear,ramp,mercury,deel,zapier,buffer,helpscout,ghost,supabase,railway,render,tailwind,mui')
        .split(',').map((s) => s.trim()).filter(Boolean),
    },
    lever: {
      enabled: process.env.LEVER_ENABLED !== 'false',
      companies: (process.env.LEVER_COMPANIES || 'netflix,spotify,canva,postman,figma,brex,datadog')
        .split(',').map((s) => s.trim()).filter(Boolean),
    },
    internshala: { enabled: process.env.INTERNSHALA_ENABLED !== 'false' },
  },
};
