/**
 * Resume Analyzer controller
 * POST /api/resume/analyze — upload resume file, get full AI analysis
 */
const fs          = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const { analyzeResume } = require('../services/resumeAnalyzer.service');

const analyze = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Please upload a resume file (PDF, DOC, DOCX).'));

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const profile  = req.user ? {
    headline: req.user.headline,
    skills:   req.user.skills,
    name:     req.user.name,
  } : {};

  try {
    const result = await analyzeResume(filePath, mimeType, profile);
    res.json({ success: true, ...result });
  } finally {
    // Always clean up the temp file
    fs.promises.unlink(filePath).catch(() => {});
  }
});

module.exports = { analyze };
