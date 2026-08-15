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

  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobhive',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
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
      enabled: process.env.JOOBLE_ENABLED === 'true',
      key: process.env.JOOBLE_API_KEY || '',
      baseUrl: 'https://jooble.org/api',
    },
    adzuna: {
      enabled: process.env.ADZUNA_ENABLED === 'true',
      appId: process.env.ADZUNA_APP_ID || '',
      appKey: process.env.ADZUNA_APP_KEY || '',
      country: process.env.ADZUNA_COUNTRY || 'gb',
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
    },
    arbeitnow: { enabled: process.env.ARBEITNOW_ENABLED === 'true' },
    remotive: { enabled: process.env.REMOTIVE_ENABLED === 'true' },
    muse: { enabled: process.env.MUSE_ENABLED === 'true' },
    himalayas: { enabled: process.env.HIMALAYAS_ENABLED === 'true' },
    jobicy: { enabled: process.env.JOBICY_ENABLED === 'true' },
    greenhouse: {
      enabled: process.env.GREENHOUSE_ENABLED === 'true',
      companies: process.env.GREENHOUSE_COMPANIES
        ? process.env.GREENHOUSE_COMPANIES.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    },
    amazon: { enabled: process.env.AMAZON_ENABLED === 'true' },
    ashby: {
      enabled: process.env.ASHBY_ENABLED === 'true',
      companies: process.env.ASHBY_COMPANIES
        ? process.env.ASHBY_COMPANIES.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    },
    lever: {
      enabled: process.env.LEVER_ENABLED !== 'false',
      companies: process.env.LEVER_COMPANIES
        ? process.env.LEVER_COMPANIES.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    },
    internshala: { enabled: process.env.INTERNSHALA_ENABLED === 'true' },
  },
};
