const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadResume } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResumeFile,
  getResumeScore,
  toggleSavedJob,
  getSavedJobs,
} = require('../controllers/candidate.controller');
const { validateUpdateProfile } = require('../validators');

router.use(protect, authorize('candidate'));

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.post('/avatar', uploadImage.single('image'), uploadAvatar);
router.post('/resume', uploadResume.single('file'), uploadResumeFile);
router.get('/resume-score', getResumeScore);
router.get('/saved', getSavedJobs);
router.post('/saved/:jobId', toggleSavedJob);
router.delete('/saved/:jobId', toggleSavedJob);

module.exports = router;
