const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidators');
const { updateProfileSchema } = require('../validators/userValidators');
const {
  companyRegisterSchema,
  updateCompanySchema,
} = require('../validators/companyValidators');
const {
  jobCreateSchema,
  jobUpdateSchema,
  applyJobSchema,
  reportSchema,
  updateStatusSchema,
  scheduleInterviewSchema,
} = require('../validators/jobValidators');
const { adminActionSchema, resolveReportSchema } = require('../validators/adminValidators');

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateVerifyEmail: validate(verifyEmailSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateUpdateProfile: validate(updateProfileSchema),
  validateCompanyRegister: validate(companyRegisterSchema),
  validateCompanyUpdate: validate(updateCompanySchema),
  validateJobCreate: validate(jobCreateSchema),
  validateJobUpdate: validate(jobUpdateSchema),
  validateApplyJob: validate(applyJobSchema),
  validateReport: validate(reportSchema),
  validateUpdateStatus: validate(updateStatusSchema),
  validateScheduleInterview: validate(scheduleInterviewSchema),
  validateAdminAction: validate(adminActionSchema),
  validateResolveReport: validate(resolveReportSchema),
};
