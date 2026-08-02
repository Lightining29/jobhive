const router = require('express').Router();
const { protect, optionalProtect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const jobs = require('../controllers/jobs.controller');
const recruiter = require('../controllers/recruiter.controller');
const {
  validateApplyJob,
  validateJobCreate,
  validateJobUpdate,
  validateCompanyRegister,
  validateCompanyUpdate,
  validateReport,
  validateUpdateStatus,
  validateScheduleInterview,
} = require('../validators');

router.get('/', optionalProtect, jobs.listJobs);
router.get('/stats', jobs.getStats);
router.get('/home', optionalProtect, jobs.homeFeed);
router.get('/recommendations', protect, jobs.getRecommendations);
router.post('/semantic-search', optionalProtect, jobs.semanticSearch);

router.get('/my-applications', protect, jobs.myApplications);

router.get('/:id', optionalProtect, jobs.getJob);

router.post('/:id/apply', protect, authorize('candidate'), validateApplyJob, jobs.applyToJob);
router.post('/:id/report', protect, validateReport, jobs.reportJob);

router.use('/recruiter', protect, authorize('recruiter'));
router.get('/recruiter/dashboard', recruiter.dashboard);
router.post('/recruiter/company', validateCompanyRegister, recruiter.registerCompany);
router.get('/recruiter/company', recruiter.getMyCompany);
router.put('/recruiter/company', validateCompanyUpdate, recruiter.updateCompany);
router.post('/recruiter/company/logo', uploadImage.single('image'), recruiter.uploadLogo);
router.post('/recruiter/jobs', validateJobCreate, recruiter.postJob);
router.put('/recruiter/jobs/:id', validateJobUpdate, recruiter.updateJob);
router.delete('/recruiter/jobs/:id', recruiter.deleteJob);
router.get('/recruiter/my-jobs', recruiter.myJobs);
router.get('/recruiter/applications', recruiter.applicationsForMyJobs);
router.put('/recruiter/applications/:id/status', validateUpdateStatus, recruiter.updateApplicationStatus);
router.post('/recruiter/applications/:id/interview', validateScheduleInterview, recruiter.scheduleInterview);

module.exports = router;
