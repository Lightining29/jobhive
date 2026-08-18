const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss');

const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { startCronJobs } = require('./cron/jobs');
const { uploadDir } = require('./middleware/upload');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Disable default CSP — portfolio pages load Google Fonts and CDN assets.
    // CSP is not relevant for JSON API responses.
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        env.clientUrl,
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowed.some(u => origin.startsWith(u)) ||
        origin.includes('hostingersite.com') ||
        origin.includes('jobhive.app') ||
        origin.includes('jobworkplace.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use(compression());

app.use(mongoSanitize());

app.use((req, res, next) => {
  const originalSend = res.json;
  res.json = function (payload) {
    const isPlainObject = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      const proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    };
    const sanitize = (obj) => {
      if (typeof obj === 'string') return xss(obj);
      if (Array.isArray(obj)) return obj.map(sanitize);
      if (isPlainObject(obj)) {
        const out = {};
        Object.keys(obj).forEach((k) => {
          if (k === 'password' || k === 'verificationToken' || k === 'resetPasswordToken') return;
          out[k] = sanitize(obj[k]);
        });
        return out;
      }
      return obj;
    };
    return originalSend.call(this, sanitize(payload));
  };
  next();
});

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(uploadDir)));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'JobHive API is running',
    time: new Date().toISOString(),
    env: env.nodeEnv,
  });
});

app.use('/api/auth', apiLimiter, require('./routes/auth.routes'));
app.use('/api/jobs', apiLimiter, require('./routes/jobs.routes'));
app.use('/api/candidate', apiLimiter, require('./routes/candidate.routes'));
app.use('/api/admin', apiLimiter, require('./routes/admin.routes'));
app.use('/api/notifications', apiLimiter, require('./routes/notifications.routes'));
app.use('/api/voice',  apiLimiter, require('./routes/voice.routes'));
app.use('/api/resume',             require('./routes/resumeAnalyzer.routes'));
app.use('/api/news',      require('./routes/careerNews.routes'));
app.use('/api/cards', apiLimiter, require('./routes/cards.routes'));
app.use('/api/ai',    apiLimiter, require('./routes/ai.routes'));

// ── Dynamic SEO Endpoints ─────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Job = require('./models/Job');
    const jobs = await Job.find({ status: 'active' }).select('_id updatedAt createdAt').sort({ updatedAt: -1 }).limit(1000).lean();
    const siteUrl = env.clientUrl ? env.clientUrl.replace(/\/$/, '') : 'https://jobworkplace.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    const staticPages = [
      { loc: '', changefreq: 'daily', priority: '1.0' },
      { loc: '/jobs', changefreq: 'hourly', priority: '0.95' },
      { loc: '/jobs?search=Java', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs?search=Java+Developer', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs?search=Spring+Boot', changefreq: 'daily', priority: '0.85' },
      { loc: '/jobs?search=Python', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs?search=React', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs?search=Full+Stack', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs?search=Remote', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs/technical', changefreq: 'hourly', priority: '0.85' },
      { loc: '/jobs/non-technical', changefreq: 'daily', priority: '0.85' },
      { loc: '/jobs/remote', changefreq: 'hourly', priority: '0.90' },
      { loc: '/jobs/hybrid', changefreq: 'daily', priority: '0.80' },
      { loc: '/jobs/onsite', changefreq: 'daily', priority: '0.80' },
      { loc: '/about', changefreq: 'monthly', priority: '0.70' },
      { loc: '/career-news', changefreq: 'daily', priority: '0.75' },
    ];
    
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${siteUrl}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }
    
    for (const job of (jobs || [])) {
      const lastMod = (job.updatedAt || job.createdAt || new Date()).toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${siteUrl}/jobs/${job._id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.80</priority>\n  </url>\n`;
    }
    
    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  const siteUrl = env.clientUrl ? env.clientUrl.replace(/\/$/, '') : 'https://jobworkplace.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nAllow: /jobs\nAllow: /jobs/*\nAllow: /about\nAllow: /career-news\n\nDisallow: /candidate/\nDisallow: /recruiter/\nDisallow: /admin/\nDisallow: /auth/\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

const fs = require('fs');

// ── Serve Frontend static files if dist directory exists, or root health endpoint ──
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/p/') ||
      req.path.startsWith('/portfolio/') ||
      req.path.startsWith('/uploads')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'JobHive API is running',
      health: '/api/health',
    });
  });
}

app.use(notFound);
app.use(errorHandler);

const { initDatabases } = require('./config/database');

const startServer = async () => {
  try {
    await initDatabases();
    startCronJobs();

    if (env.nodeEnv !== 'test') {
      // Create a raw http.Server so Socket.IO can share the same port
      const http = require('http');
      const { initSocketIO } = require('./socket');
      const server = http.createServer(app);

      // Attach Socket.IO — zero changes to existing REST routes
      initSocketIO(server);

      server.listen(env.port, '0.0.0.0', () => {
        logger.info(`[server] API + Socket.IO listening on http://0.0.0.0:${env.port}`);
        console.log("Backend Start Successfully")
      });
      server.on('error', (err) => {
        logger.error('[server] failed to start', { message: err.message });
        process.exit(1);
      });
    }
  } catch (err) {
    logger.error('[server] startup failed', { message: err.message });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
