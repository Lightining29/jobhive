const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const User         = require('../models/User');
const { generatePortfolioSite } = require('../services/portfolioGenerator.service');
const { listThemes }            = require('../services/portfolioThemes');
const deploymentService         = require('../services/deployment.service');

/**
 * GET /api/portfolio/themes
 * Returns available theme options for the frontend picker.
 */
const getThemes = (req, res) => {
  res.json({ success: true, themes: listThemes() });
};

/**
 * POST /api/portfolio/generate
 * Body: { theme?: string }
 */
const generate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'User not found.');
  if (!user.name) throw new ApiError(400, 'Please add your name to your profile before generating a portfolio.');

  const theme = req.body?.theme || 'dark-orange';
  const { files, meta, content } = await generatePortfolioSite(user, theme);

  const deployment = await deploymentService.publishDeployment(
    req.user._id,
    files,
    {
      name:        meta.name        || content?.name        || user.name,
      title:       meta.title       || content?.title       || '',
      description: meta.description || content?.metaDescription || '',
      theme,
    }
  );

  const liveUrl = deploymentService.buildLiveUrl(deployment.slug);

  res.json({
    success:      true,
    deploymentId: deployment._id,
    slug:         deployment.slug,
    url:          liveUrl,
    theme,
    message:      'Portfolio generated and deployed successfully!',
  });
});

module.exports = { generate, getThemes };
