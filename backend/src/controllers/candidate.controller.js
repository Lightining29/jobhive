const UserSQL = require('../models/sql/User.sql');
const JobSQL = require('../models/sql/Job.sql');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../services/cloudinary.service');
const fs = require('fs');
const { uploadDir } = require('../middleware/upload');
const env = require('../config/env');

const getProfile = asyncHandler(async (req, res) => {
  const user = await UserSQL.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const totalFields = 9;
  let completed = 0;
  if (user.headline) completed += 1;
  if (user.avatar) completed += 1;
  if (user.resume && user.resume.url) completed += 1;
  if (user.skills && user.skills.length) completed += 1;
  if (user.experience && user.experience.length) completed += 1;
  if (user.education && user.education.length) completed += 1;
  if (user.certifications && user.certifications.length) completed += 1;
  if (user.bio) completed += 1;
  if (user.socialLinks && (user.socialLinks.linkedin || user.socialLinks.github || user.socialLinks.portfolio)) completed += 1;
  const profileCompletion = Math.round((completed / totalFields) * 100);

  res.json({ success: true, profile: user.toSafeJSON(), profileCompletion });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserSQL.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const allowed = ['name', 'phone', 'headline', 'bio', 'skills', 'education', 'experience', 'certifications', 'socialLinks', 'preferences'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  await user.save();
  res.json({ success: true, message: 'Profile updated.', user: user.toSafeJSON() });
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No image uploaded.'));
  const user = await UserSQL.findByPk(req.user.id);
  if (!user) return next(new ApiError(404, 'User not found'));

  let localPath = null;
  try {
    let avatarUrl = '';
    if (cloudinary.isConfigured()) {
      const uploaded = await cloudinary.uploadImage({ filePath: req.file.path });
      avatarUrl = uploaded.url;
      if (user.avatar && user.avatar.includes('cloudinary')) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.removeByPublicId(`jobhive/${publicId}`);
      }
    } else {
      // Local static storage
      avatarUrl = `/uploads/${req.file.filename}`;
      localPath = req.file.path;
    }
    user.avatar = avatarUrl;
    await user.save();
    res.json({ success: true, message: 'Avatar uploaded successfully.', user: user.toSafeJSON() });
  } finally {
    if (cloudinary.isConfigured() && localPath === null && req.file.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
});

const uploadResumeFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No file uploaded.'));
  const user = await UserSQL.findByPk(req.user.id);
  if (!user) return next(new ApiError(404, 'User not found'));

  let localPath = null;
  try {
    let resumeUrl = '';
    let publicId = '';
    if (cloudinary.isConfigured()) {
      const uploaded = await cloudinary.uploadFile({
        filePath: req.file.path,
        resourceType: 'auto',
      });
      resumeUrl = uploaded.url;
      publicId = uploaded.publicId || '';
    } else {
      const baseUrl = env.baseUrl || '';
      resumeUrl = `${baseUrl}/uploads/${req.file.filename}`;
      localPath = req.file.path;
    }
    if (user.resume && user.resume.publicId && cloudinary.isConfigured()) {
      await cloudinary.removeByPublicId(user.resume.publicId);
    }
    user.resume = {
      url: resumeUrl,
      publicId,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };
    await user.save();
    res.json({ success: true, message: 'Resume uploaded successfully.', resume: user.resume });
  } finally {
    if (cloudinary.isConfigured() && localPath === null && req.file.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
});

const resumeScore = (profile) => {
  let score = 0;
  if (profile.resume && profile.resume.url) score += 30;
  if (profile.skills && profile.skills.length >= 5) score += 20;
  else if (profile.skills && profile.skills.length) score += 10;
  if (profile.headline) score += 10;
  if (profile.bio && profile.bio.length >= 100) score += 10;
  if (profile.experience && profile.experience.length) score += 15;
  if (profile.education && profile.education.length) score += 5;
  if (profile.certifications && profile.certifications.length) score += 5;
  if (profile.avatar) score += 5;
  return Math.min(score, 100);
};

const getResumeScore = asyncHandler(async (req, res) => {
  const user = await UserSQL.findByPk(req.user.id);
  const score = user ? resumeScore(user) : 0;
  res.json({ success: true, score });
});

const toggleSavedJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const user = await UserSQL.findByPk(req.user.id);
  if (!user) return next(new ApiError(404, 'User not found'));

  let savedJobs = Array.isArray(user.preferences?.savedJobs) ? [...user.preferences.savedJobs] : [];
  const index = savedJobs.indexOf(String(jobId));
  let saved = false;
  if (index > -1) {
    savedJobs.splice(index, 1);
  } else {
    savedJobs.push(String(jobId));
    saved = true;
  }
  user.preferences = { ...(user.preferences || {}), savedJobs };
  await user.save();
  res.json({ success: true, saved, message: saved ? 'Job saved.' : 'Job removed from saved.' });
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await UserSQL.findByPk(req.user.id);
  const savedJobIds = Array.isArray(user?.preferences?.savedJobs) ? user.preferences.savedJobs : [];
  const jobs = savedJobIds.length > 0 ? await JobSQL.findAll({ where: { jobId: savedJobIds, isActive: true } }) : [];
  res.json({ success: true, jobs });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResumeFile,
  getResumeScore,
  toggleSavedJob,
  getSavedJobs,
};
