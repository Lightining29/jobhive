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
    origin: env.clientUrl,
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
app.use('/api/portfolio',    require('./routes/portfolio.routes'));
app.use('/api/deployments', apiLimiter, require('./routes/deployment.routes'));

// ── Static portfolio hosting ── serve /p/:slug and wildcard subdomains ────────
const DEPLOYMENTS_DIR = path.join(__dirname, '..', 'deployments');
const fs = require('fs');

// ── Subdomain → /p/:slug rewrite ─────────────────────────────────────────────
// Host: manish.jobhive.app  →  req.url = /p/manish/...
app.use((req, res, next) => {
  if (!env.appDomain) return next();
  const host   = (req.headers.host || '').toLowerCase().split(':')[0]; // strip port
  const suffix = '.' + env.appDomain;
  if (host.endsWith(suffix)) {
    const sub = host.slice(0, -suffix.length);
    if (sub && /^[a-z0-9-]+$/.test(sub)) {
      const pathname = req.path || '/';
      req.url = '/p/' + sub + (pathname === '/' ? '/' : pathname);
    }
  }
  next();
});

// ── Cache headers for portfolio assets ───────────────────────────────────────
app.use('/p', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (['.css','.js','.svg','.png','.jpg','.jpeg','.webp','.gif',
       '.ico','.woff','.woff2','.ttf'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

// ── Static assets: /p/:slug/file.css → deployments/:slug/current/file.css ───
// We mount a per-request static handler so assets resolve from current/
app.use('/p/:slug', (req, res, next) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(404).send('Not found');
  const currentDir = path.join(DEPLOYMENTS_DIR, slug, 'current');
  if (!fs.existsSync(currentDir)) return next();
  express.static(currentDir, { index: false })(req, res, next);
});

// ── HTML: GET /p/:slug  →  deployments/:slug/current/index.html ─────────────
app.get('/p/:slug', (req, res) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(404).send('Not found');

  // Redirect bare slug to trailing slash so relative paths resolve correctly
  if (!req.path.endsWith('/')) {
    return res.redirect(301, '/p/' + slug + '/');
  }

  const indexPath = path.join(DEPLOYMENTS_DIR, slug, 'current', 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send(
      '<html><body style="font-family:sans-serif;padding:3rem;text-align:center">' +
      '<h2>Portfolio not found</h2><p>This portfolio may not exist or has been deleted.</p>' +
      '</body></html>'
    );
  }

  // Fire-and-forget view count
  require('./models/Deployment')
    .findOneAndUpdate(
      { slug, live: true },
      { $inc: { 'analytics.views': 1 }, $set: { 'analytics.lastViewed': new Date() } }
    )
    .catch(() => {});

  res.sendFile(indexPath);
});

// ── robots.txt per portfolio ─────────────────────────────────────────────────
app.get('/p/:slug/robots.txt', async (req, res) => {
  const slug = req.params.slug;
  try {
    const dep       = await require('./models/Deployment').findOne({ slug }).lean();
    const indexable = dep?.settings?.indexable !== false;
    const liveUrl   = env.appDomain
      ? `https://${slug}.${env.appDomain}`
      : `${(env.baseUrl || 'http://localhost:5000').replace(/\/$/, '')}/p/${slug}`;
    res.type('text/plain').send(
      indexable
        ? `User-agent: *\nAllow: /\nSitemap: ${liveUrl}/sitemap.xml`
        : `User-agent: *\nDisallow: /`
    );
  } catch {
    res.type('text/plain').send('User-agent: *\nDisallow: /');
  }
});

// ── sitemap.xml per portfolio ────────────────────────────────────────────────
app.get('/p/:slug/sitemap.xml', async (req, res) => {
  const slug    = req.params.slug;
  const liveUrl = env.appDomain
    ? `https://${slug}.${env.appDomain}`
    : `${(env.baseUrl || 'http://localhost:5000').replace(/\/$/, '')}/p/${slug}`;
  try {
    const dep = await require('./models/Deployment').findOne({ slug, live: true }).lean();
    if (!dep) return res.status(404).send('Not found');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${liveUrl}/</loc>
    <lastmod>${new Date(dep.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
    );
  } catch {
    res.status(500).send('Error');
  }
});

// ── Serve Frontend static files if dist directory exists, or root health endpoint ──
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/p/') || req.path.startsWith('/uploads')) {
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

const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();

    if (env.nodeEnv !== 'test') {
      // Create a raw http.Server so Socket.IO can share the same port
      const http = require('http');
      const { initSocketIO } = require('./socket');
      const server = http.createServer(app);

      // Attach Socket.IO — zero changes to existing REST routes
      initSocketIO(server);

      server.listen(env.port, () => {
        logger.info(`[server] API + Socket.IO listening on http://localhost:${env.port}`);
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
