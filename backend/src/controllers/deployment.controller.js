const asyncHandler     = require('../utils/asyncHandler');
const ApiError         = require('../utils/ApiError');
const User             = require('../models/User');
const Deployment       = require('../models/Deployment');
const { generatePortfolioSite } = require('../services/portfolioGenerator.service');
const deploymentService    = require('../services/deployment.service');

// ── POST /api/deployments/publish ─────────────────────────────────────────────
const publish = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'User not found');
  if (!user.name) throw new ApiError(400, 'Please add your name to your profile before publishing');

  const theme = req.body?.theme || 'dark-orange';
  const { files, meta, content } = await generatePortfolioSite(user, theme);

  const metaData = {
    name:        meta.name        || content?.name        || user.name,
    title:       meta.title       || content?.title       || '',
    description: meta.description || content?.metaDescription || '',
    theme,
  };

  const deployment = await deploymentService.publishDeployment(req.user._id, files, metaData);
  const liveUrl    = deploymentService.buildLiveUrl(deployment.slug);

  res.status(200).json({ success: true, deployment, liveUrl, url: liveUrl });
});

// ── GET /api/deployments ──────────────────────────────────────────────────────
const listDeployments = asyncHandler(async (req, res) => {
  const deployments = await deploymentService.getUserDeployments(req.user._id);
  res.json({ success: true, deployments });
});

// ── GET /api/deployments/:id ──────────────────────────────────────────────────
const getDeployment = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findOne({
    _id:    req.params.id,
    userId: req.user._id,
  }).lean();

  if (!deployment) throw new ApiError(404, 'Deployment not found');

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);
  res.json({ success: true, deployment, liveUrl });
});

// ── POST /api/deployments/:id/rollback?version=N ──────────────────────────────
const rollback = asyncHandler(async (req, res) => {
  const version = parseInt(req.query.version, 10);
  if (!version || version < 1) throw new ApiError(400, 'Provide a valid ?version= number');

  const deployment = await deploymentService.rollbackDeployment(
    req.params.id, req.user._id, version
  );

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);
  res.json({ success: true, deployment, liveUrl, message: `Rolled back to v${version}` });
});

// ── DELETE /api/deployments/:id ───────────────────────────────────────────────
const deleteDeployment = asyncHandler(async (req, res) => {
  await deploymentService.deleteDeployment(req.params.id, req.user._id);
  res.json({ success: true, message: 'Deployment deleted' });
});

// ── POST /api/deployments/:id/toggle ─────────────────────────────────────────
const toggleDeployment = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findOne({
    _id:    req.params.id,
    userId: req.user._id,
  });
  if (!deployment) throw new ApiError(404, 'Deployment not found');

  deployment.live   = !deployment.live;
  deployment.status = deployment.live ? 'live' : 'offline';
  await deployment.save();

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);
  res.json({
    success: true,
    deployment: deployment.toObject(),
    liveUrl,
    message: deployment.live ? 'Portfolio is now live' : 'Portfolio is now offline',
  });
});

// ── GET /api/deployments/:id/qr ──────────────────────────────────────────────
const getQRCode = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findOne({
    _id:    req.params.id,
    userId: req.user._id,
  }).lean();
  if (!deployment) throw new ApiError(404, 'Deployment not found');

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(liveUrl)}`;

  res.json({ success: true, qrUrl, liveUrl });
});

// ── POST /api/deployments/:id/theme  ─────────────────────────────────────────
// Reapplies a new theme to the existing deployment without full regeneration.
const changeTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  if (!theme) throw new ApiError(400, 'theme is required');

  const deployment = await Deployment.findOne({
    _id:    req.params.id,
    userId: req.user._id,
  });
  if (!deployment) throw new ApiError(404, 'Deployment not found');

  const path = require('path');
  const fs   = require('fs');
  const { applyTheme }  = require('../services/portfolioThemes');
  const { DEPLOYMENTS_DIR } = require('../services/deployment.service');

  // Load base CSS template
  const TEMPLATE_DIR = path.resolve(DEPLOYMENTS_DIR, '..', '..', '..');
  const baseCSSPath  = path.join(TEMPLATE_DIR, 'style.css');
  if (!fs.existsSync(baseCSSPath)) throw new ApiError(500, 'Base CSS template not found');

  const baseCSS   = fs.readFileSync(baseCSSPath, 'utf8');
  const themedCSS = applyTheme(baseCSS, theme);

  const currentDir = path.join(DEPLOYMENTS_DIR, deployment.slug, 'current');
  if (!fs.existsSync(currentDir)) throw new ApiError(404, 'Deployment files not found on disk');

  // Update style.css on disk
  fs.writeFileSync(path.join(currentDir, 'style.css'), themedCSS, 'utf8');

  // Re-inject into <style> block in index.html
  const htmlPath = path.join(currentDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    const styleStart = html.indexOf('<style>');
    const styleEnd   = html.indexOf('</style>');
    if (styleStart !== -1 && styleEnd !== -1) {
      html = html.slice(0, styleStart + 7) + '\n' + themedCSS + '\n  ' + html.slice(styleEnd);
      fs.writeFileSync(htmlPath, html, 'utf8');
    }
  }

  // Persist theme in DB
  deployment.theme = theme;
  await deployment.save();

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);
  res.json({
    success: true,
    theme,
    liveUrl,
    message: `Theme changed to ${theme}`,
  });
});

module.exports = {
  publish, listDeployments, getDeployment, rollback,
  deleteDeployment, toggleDeployment, getQRCode, changeTheme,
};
