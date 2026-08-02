const asyncHandler    = require('../utils/asyncHandler');
const { getCareerNews } = require('../services/careerNews.service');

/**
 * GET /api/news/career
 * Returns latest tech career news + AI insights.
 * Query params:
 *   ?refresh=true  — force cache bypass
 *   ?fast=true     — skip slow AI summarization, return faster
 */
const getNews = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const fastMode     = req.query.fast === 'true';
  const data = await getCareerNews(forceRefresh, fastMode);
  res.json({ success: true, ...data });
});

module.exports = { getNews };
