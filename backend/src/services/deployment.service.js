/**
 * deployment.service.js
 *
 * Folder layout per deployment:
 *
 *   deployments/
 *     {slug}/
 *       current/          ← live site served by Express / Nginx
 *         index.html
 *         style.css
 *         script.js
 *         favicon.svg
 *         og-image.svg
 *         robots.txt
 *         sitemap.xml
 *       v1/               ← versioned snapshots (never deleted)
 *       v2/
 *       v3/
 */

const path = require('path');
const fs   = require('fs');

const Deployment = require('../models/Deployment');
const logger     = require('../config/logger');
const env        = require('../config/env');

// ── Base directory ────────────────────────────────────────────────────────────
const DEPLOYMENTS_DIR = path.join(__dirname, '..', '..', 'deployments');

if (!fs.existsSync(DEPLOYMENTS_DIR)) {
  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  logger.info('[deployment] Created deployments directory: ' + DEPLOYMENTS_DIR);
}

// ── Security helpers ──────────────────────────────────────────────────────────
function safePath(base, ...parts) {
  const joined   = path.resolve(path.join(base, ...parts));
  const resolved = path.resolve(base);
  if (!joined.startsWith(resolved + path.sep) && joined !== resolved) {
    throw new Error('Path traversal detected');
  }
  return joined;
}

function isValidFileName(name) {
  if (typeof name !== 'string' || name.length === 0 || name.length > 100) return false;
  if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes(':')) return false;
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

// ── Build the public URL for a slug ──────────────────────────────────────────
function buildLiveUrl(slug) {
  if (env.appDomain) {
    return `https://${slug}.${env.appDomain}`;
  }
  const base = (env.baseUrl || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}/p/${slug}`;
}

// ── Promote version dir → current/ ───────────────────────────────────────────
function promoteToLive(versionDir, currentDir) {
  if (!fs.existsSync(versionDir)) throw new Error('Version folder missing: ' + versionDir);

  // Wipe and recreate current/
  if (fs.existsSync(currentDir)) {
    fs.rmSync(currentDir, { recursive: true, force: true });
  }
  fs.mkdirSync(currentDir, { recursive: true });

  // Copy all files from the version snapshot into current/
  const files = fs.readdirSync(versionDir);
  for (const name of files) {
    const src  = path.join(versionDir, name);
    const dest = path.join(currentDir, name);
    if (typeof fs.cpSync === 'function') {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// ── Write site files to a directory ──────────────────────────────────────────
async function writeSiteFiles(files, dir, slug) {
  await fs.promises.mkdir(dir, { recursive: true });

  const entries = Object.entries(files || {});
  await Promise.all(entries.map(async ([name, content]) => {
    if (!isValidFileName(name)) {
      logger.warn('[deployment] Skipping unsafe filename: ' + name);
      return;
    }
    await fs.promises.writeFile(safePath(dir, name), content, 'utf8');
  }));

  // robots.txt and sitemap.xml
  const siteUrl = buildLiveUrl(slug);
  await fs.promises.writeFile(
    safePath(dir, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
    'utf8'
  );
  await fs.promises.writeFile(
    safePath(dir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n` +
    `</urlset>\n`,
    'utf8'
  );
}

// ── Slug generation ───────────────────────────────────────────────────────────
async function generateSlug(name, excludeUserId = null) {
  const base = (name || 'portfolio')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'portfolio';

  let candidate = base;
  let counter   = 2;

  while (true) {
    const query = { slug: candidate };
    if (excludeUserId) query.userId = { $ne: excludeUserId };
    const existing = await Deployment.findOne(query).lean();
    if (!existing) break;
    candidate = `${base}-${counter++}`;
  }

  return candidate;
}

// ── Main publish ──────────────────────────────────────────────────────────────
async function publishDeployment(userId, files, meta = {}) {
  if (!files || typeof files !== 'object') {
    throw new Error('No site files provided for deployment');
  }
  const html = typeof files['index.html'] === 'string' ? files['index.html'] : '';

  let deployment = await Deployment.findOne({ userId });
  const isNew    = !deployment;
  let slug, newVersion;

  if (isNew) {
    slug       = await generateSlug(meta.name || 'portfolio');
    newVersion = 1;
  } else {
    slug       = deployment.slug;
    newVersion = (deployment.version || 1) + 1;
  }

  //  deployments/{slug}/v{n}/   ← snapshot
  //  deployments/{slug}/current/ ← live
  const slugDir    = safePath(DEPLOYMENTS_DIR, slug);
  const versionDir = safePath(DEPLOYMENTS_DIR, slug, `v${newVersion}`);
  const currentDir = safePath(DEPLOYMENTS_DIR, slug, 'current');

  await writeSiteFiles(files, versionDir, slug);
  promoteToLive(versionDir, currentDir);

  const historyEntry = { version: newVersion, deployedAt: new Date(), path: versionDir };

  if (isNew) {
    deployment = await Deployment.create({
      userId,
      slug,
      version:        newVersion,
      deploymentPath: currentDir,
      status:         'live',
      live:           true,
      theme:          meta.theme || 'dark-orange',
      html,
      meta: {
        title:       meta.title       || meta.name || '',
        description: meta.description || '',
        name:        meta.name        || '',
      },
      history: [historyEntry],
    });
  } else {
    deployment.version        = newVersion;
    deployment.deploymentPath = currentDir;
    deployment.status         = 'live';
    deployment.live           = true;
    deployment.theme          = meta.theme || deployment.theme || 'dark-orange';
    deployment.html           = html;
    deployment.meta           = {
      title:       meta.title       || meta.name || deployment.meta?.title || '',
      description: meta.description || deployment.meta?.description || '',
      name:        meta.name        || deployment.meta?.name || '',
    };
    deployment.history.push(historyEntry);
    await deployment.save();
  }

  const doc = deployment.toObject();
  delete doc.html;
  return doc;
}

// ── Rollback ──────────────────────────────────────────────────────────────────
async function rollbackDeployment(deploymentId, userId, version) {
  const deployment = await Deployment.findOne({ _id: deploymentId, userId });
  if (!deployment) throw new Error('Deployment not found');

  const versionDir = safePath(DEPLOYMENTS_DIR, deployment.slug, `v${version}`);
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version ${version} does not exist on disk`);
  }

  const currentDir = safePath(DEPLOYMENTS_DIR, deployment.slug, 'current');
  promoteToLive(versionDir, currentDir);

  const htmlPath = path.join(versionDir, 'index.html');
  const html     = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : deployment.html;

  deployment.version        = version;
  deployment.deploymentPath = currentDir;
  deployment.status         = 'live';
  deployment.live           = true;
  deployment.html           = html;
  deployment.history.push({ version, deployedAt: new Date(), path: versionDir });
  await deployment.save();

  const doc = deployment.toObject();
  delete doc.html;
  return doc;
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteDeployment(deploymentId, userId) {
  const deployment = await Deployment.findOne({ _id: deploymentId, userId });
  if (!deployment) throw new Error('Deployment not found');

  const slugDir = safePath(DEPLOYMENTS_DIR, deployment.slug);
  if (fs.existsSync(slugDir)) {
    fs.rmSync(slugDir, { recursive: true, force: true });
  }

  await Deployment.deleteOne({ _id: deploymentId });
  return true;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
async function incrementViews(slug) {
  await Deployment.findOneAndUpdate(
    { slug, live: true },
    { $inc: { 'analytics.views': 1 }, $set: { 'analytics.lastViewed': new Date() } }
  );
}

// ── Queries ───────────────────────────────────────────────────────────────────
async function getDeploymentBySlug(slug) {
  return Deployment.findOne({ slug }).select('+html').lean();
}

async function getUserDeployments(userId) {
  return Deployment.find({ userId }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  DEPLOYMENTS_DIR,
  buildLiveUrl,
  generateSlug,
  publishDeployment,
  rollbackDeployment,
  deleteDeployment,
  incrementViews,
  getDeploymentBySlug,
  getUserDeployments,
  writeSiteFiles,
  isValidFileName,
};
