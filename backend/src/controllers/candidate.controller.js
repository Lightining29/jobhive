const UserSQL = require('../models/sql/User.sql');
const JobSQL = require('../models/sql/Job.sql');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../services/cloudinary.service');
const fs = require('fs');
const { uploadDir } = require('../middleware/upload');
const env = require('../config/env');

const getProfile = asyncHandler(async (req, res) => {
  let user = null;
  try {
    user = await UserSQL.findByPk(req.user.id);
  } catch (e) {}
  if (!user && req.user?.email) {
    try {
      user = await UserSQL.findOne({ where: { email: req.user.email } });
    } catch (e) {}
  }
  if (!user) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findById(req.user.id);
    } catch (e) {}
  }
  if (!user && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findOne({ email: req.user.email });
    } catch (e) {}
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Cross-sync avatar if missing in SQL but present in Mongo
  if (!user.avatar && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      const mUser = await UserMongo.findOne({ email: req.user.email });
      if (mUser?.avatar) {
        user.avatar = mUser.avatar;
      }
    } catch (e) {}
  }

  const safeUser = user.toSafeJSON ? user.toSafeJSON() : (user.toJSON ? user.toJSON() : user);

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

  res.json({ success: true, profile: safeUser, profileCompletion });
});

const updateProfile = asyncHandler(async (req, res) => {
  let user = null;
  try {
    user = await UserSQL.findByPk(req.user.id);
  } catch (e) {}
  if (!user && req.user?.email) {
    try {
      user = await UserSQL.findOne({ where: { email: req.user.email } });
    } catch (e) {}
  }
  if (!user) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findById(req.user.id);
    } catch (e) {}
  }
  if (!user && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findOne({ email: req.user.email });
    } catch (e) {}
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const allowed = ['name', 'phone', 'headline', 'bio', 'skills', 'education', 'experience', 'certifications', 'socialLinks', 'preferences', 'avatar'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      if (field === 'avatar' && (req.body[field] === '' || req.body[field].startsWith('blob:'))) return;
      user[field] = req.body[field];
    }
  });
  await user.save();

  // Sync Mongo if active
  try {
    const UserMongo = require('../models/User');
    if (UserMongo && req.user.email) {
      const updateData = { ...req.body };
      if (!updateData.avatar || updateData.avatar.startsWith('blob:')) delete updateData.avatar;
      await UserMongo.findOneAndUpdate({ email: req.user.email }, { $set: updateData });
    }
  } catch {
    // ignore
  }

  const safeUser = user.toSafeJSON ? user.toSafeJSON() : (user.toJSON ? user.toJSON() : user);
  res.json({ success: true, message: 'Profile updated.', user: safeUser });
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No image uploaded.'));

  let user = null;
  try {
    user = await UserSQL.findByPk(req.user.id);
  } catch (e) {}
  if (!user && req.user?.email) {
    try {
      user = await UserSQL.findOne({ where: { email: req.user.email } });
    } catch (e) {}
  }
  if (!user) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findById(req.user.id);
    } catch (e) {}
  }
  if (!user && req.user?.email) {
    try {
      const UserMongo = require('../models/User');
      user = await UserMongo.findOne({ email: req.user.email });
    } catch (e) {}
  }

  if (!user) return next(new ApiError(404, 'User not found'));

  let localPath = null;
  try {
    let avatarUrl = '';

    // Create database-persisted Base64 data URL so server reboots/ephemeral disks never lose the photo
    let base64DataUrl = '';
    try {
      if (req.file.path && fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mimeType = req.file.mimetype || 'image/jpeg';
        base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      }
    } catch {
      // ignore
    }

    if (cloudinary.isConfigured()) {
      try {
        const uploaded = await cloudinary.uploadImage({ filePath: req.file.path });
        avatarUrl = uploaded.url;
        if (user.avatar && user.avatar.includes('cloudinary')) {
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.removeByPublicId(`jobhive/${publicId}`).catch(() => {});
        }
      } catch {
        avatarUrl = base64DataUrl || `/uploads/${req.file.filename}`;
      }
    } else {
      // Store Base64 Data URL directly in the database for 100% permanent persistence
      avatarUrl = base64DataUrl || `/uploads/${req.file.filename}`;
      localPath = req.file.path;
    }

    // Ensure MySQL avatar column is LONGTEXT
    try {
      const { sequelize } = require('../config/mysql');
      if (sequelize) {
        await sequelize.query('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;').catch(() => {});
      }
    } catch (e) {}

    // Save to SQL user
    try {
      if (user instanceof UserSQL || user.save) {
        user.avatar = avatarUrl;
        await user.save();
      }
    } catch (sqlErr) {
      // If Base64 failed due to column size, fallback to local URL
      try {
        user.avatar = `/uploads/${req.file.filename}`;
        await user.save();
        avatarUrl = `/uploads/${req.file.filename}`;
      } catch (err2) {}
    }

    // Sync Mongo if active
    try {
      const UserMongo = require('../models/User');
      if (UserMongo && req.user.email) {
        await UserMongo.findOneAndUpdate({ email: req.user.email }, { $set: { avatar: avatarUrl } });
      }
    } catch {
      // ignore
    }

    // Sync Portfolio if active
    try {
      const Portfolio = require('../models/Portfolio');
      if (Portfolio) {
        await Portfolio.findOneAndUpdate(
          { $or: [{ userId: String(user.id || req.user.id) }, { 'hero.email': req.user.email }] },
          { $set: { 'hero.avatar': avatarUrl } }
        );
      }
    } catch {
      // ignore
    }

    const safeUser = user.toSafeJSON ? user.toSafeJSON() : (user.toJSON ? user.toJSON() : user);
    res.json({ success: true, message: 'Avatar uploaded successfully and saved in database.', user: safeUser, avatar: avatarUrl });
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

const getAvatarStream = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  let user = null;
  try {
    user = await UserSQL.findByPk(userId);
  } catch (e) {}
  if (!user) {
    try {
      user = await UserSQL.findOne({ where: { email: userId } });
    } catch (e) {}
  }
  if (!user || !user.avatar) {
    return res.status(404).send('Avatar not found');
  }

  const rawAvatar = user.avatar.trim();
  if (rawAvatar.startsWith('data:image/')) {
    const match = rawAvatar.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (match) {
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }
  }

  if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')) {
    return res.redirect(rawAvatar);
  }

  return res.status(404).send('Avatar not found');
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAvatarStream,
  uploadResumeFile,
  getResumeScore,
  toggleSavedJob,
  getSavedJobs,
};
