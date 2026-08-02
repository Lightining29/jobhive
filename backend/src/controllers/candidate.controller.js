const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../services/cloudinary.service');
const fs = require('fs');
const { uploadDir } = require('../middleware/upload');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('company')
    .populate({ path: 'savedJobs', match: { isActive: true, isExpired: false }, select: 'jobTitle companyName companyLogo salary salaryMax currency location workMode employmentType postedDate' });

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
  const allowed = ['name', 'phone', 'headline', 'bio', 'skills', 'education', 'experience', 'certifications', 'socialLinks', 'preferences'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ success: true, message: 'Profile updated.', user: req.user.toSafeJSON() });
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No image uploaded.'));
  let localPath = null;
  try {
    let avatar;
    if (cloudinary.isConfigured()) {
      avatar = await cloudinary.uploadImage({ filePath: req.file.path });
      if (req.user.avatar && req.user.avatar.includes('cloudinary')) {
        const publicId = req.user.avatar.split('/').pop().split('.')[0];
        await cloudinary.removeByPublicId(`jobhive/${publicId}`);
      }
    } else {
      avatar = { url: `/uploads/${req.file.filename}`, publicId: '' };
      localPath = req.file.path;
    }
    req.user.avatar = avatar.url;
    await req.user.save();
    res.json({ success: true, message: 'Avatar uploaded.', user: req.user.toSafeJSON() });
  } finally {
    if (cloudinary.isConfigured() && localPath === null) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
});

const uploadResumeFile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No file uploaded.'));
  let localPath = null;
  try {
    let resume;
    if (cloudinary.isConfigured()) {
      resume = await cloudinary.uploadFile({
        filePath: req.file.path,
        resourceType: 'auto',
      });
    } else {
      resume = { url: `/uploads/${req.file.filename}`, publicId: '' };
      localPath = req.file.path;
    }
    if (req.user.resume && req.user.resume.publicId) {
      await cloudinary.removeByPublicId(req.user.resume.publicId);
    }
    req.user.resume = {
      url: resume.url,
      publicId: resume.publicId || '',
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };
    await req.user.save();
    res.json({ success: true, message: 'Resume uploaded.', resume: req.user.resume });
  } finally {
    if (cloudinary.isConfigured() && localPath === null) {
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
  const user = await User.findById(req.user._id);
  const score = resumeScore(user);
  res.json({ success: true, score });
});

const toggleSavedJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const user = await User.findById(req.user._id);
  const index = user.savedJobs.findIndex((id) => id.toString() === jobId);
  let saved = false;
  if (index > -1) {
    user.savedJobs.splice(index, 1);
  } else {
    user.savedJobs.push(jobId);
    saved = true;
  }
  await user.save();
  res.json({ success: true, saved, message: saved ? 'Job saved.' : 'Job removed from saved.' });
});

const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    match: { isActive: true, isExpired: false },
    options: { sort: { postedDate: -1 } },
  });
  res.json({ success: true, jobs: user.savedJobs || [] });
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
