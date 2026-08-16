import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

const jobService = {
  list: (params) => api.get('/jobs', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  home: () => api.get('/jobs/home'),
  stats: () => api.get('/jobs/stats'),
  recommendations: (params) => api.get('/jobs/recommendations', { params }),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  myApplications: (params) => api.get('/jobs/my-applications', { params }),
  report: (id, data) => api.post(`/jobs/${id}/report`, data),
  semanticSearch: (query, page = 1) => api.post('/jobs/semantic-search', { query, page }),
  refresh: () => api.post('/jobs/refresh'),
};

const candidateService = {
  profile: () => api.get('/candidate/profile'),
  updateProfile: (data) => api.put('/candidate/profile', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/candidate/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadResume: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/candidate/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  resumeScore: () => api.get('/candidate/resume-score'),
  saved: () => api.get('/candidate/saved'),
  toggleSaved: (id) => api.post(`/candidate/saved/${id}`),
};

const recruiterService = {
  dashboard: () => api.get('/jobs/recruiter/dashboard'),
  company: () => api.get('/jobs/recruiter/company'),
  registerCompany: (data) => api.post('/jobs/recruiter/company', data),
  updateCompany: (data) => api.put('/jobs/recruiter/company', data),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/jobs/recruiter/company/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  postJob: (data) => api.post('/jobs/recruiter/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/recruiter/jobs/${id}`),
  myJobs: (params) => api.get('/jobs/recruiter/my-jobs', { params }),
  applications: (params) => api.get('/jobs/recruiter/applications', { params }),
  updateStatus: (id, status) => api.put(`/jobs/recruiter/applications/${id}/status`, { status }),
  scheduleInterview: (id, data) => api.post(`/jobs/recruiter/applications/${id}/interview`, data),
};

const adminService = {
  allInfo: () => api.get('/admin/all-info'),
  all: () => api.get('/admin'),
  dashboard: () => api.get('/admin/dashboard'),

  // Users & Credits
  users: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  grantCredits: (id, data) => api.post(`/admin/users/${id}/grant-credits`, data),
  extendTrial: (id, data) => api.post(`/admin/users/${id}/extend-trial`, data),
  changeSubscription: (id, data) => api.post(`/admin/users/${id}/change-subscription`, data),

  // Services Catalog
  services: (params) => api.get('/admin/services', { params }),
  getService: (id) => api.get(`/admin/services/${id}`),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  toggleService: (id) => api.patch(`/admin/services/${id}/toggle`),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Subscription Plans
  plans: (params) => api.get('/admin/plans', { params }),
  getPlan: (id) => api.get(`/admin/plans/${id}`),
  createPlan: (data) => api.post('/admin/plans', data),
  updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
  togglePlan: (id) => api.patch(`/admin/plans/${id}/toggle`),
  deletePlan: (id) => api.delete(`/admin/plans/${id}`),

  // Coupons & Discounts
  coupons: (params) => api.get('/admin/coupons', { params }),
  getCoupon: (id) => api.get(`/admin/coupons/${id}`),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  toggleCoupon: (id) => api.patch(`/admin/coupons/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Service Bundles
  bundles: (params) => api.get('/admin/bundles', { params }),
  getBundle: (id) => api.get(`/admin/bundles/${id}`),
  createBundle: (data) => api.post('/admin/bundles', data),
  updateBundle: (id, data) => api.put(`/admin/bundles/${id}`, data),
  deleteBundle: (id) => api.delete(`/admin/bundles/${id}`),

  // Payments & Invoices
  payments: (params) => api.get('/admin/payments', { params }),
  getPayment: (id) => api.get(`/admin/payments/${id}`),
  createManualPayment: (data) => api.post('/admin/payments/manual', data),
  refundPayment: (id, reason) => api.patch(`/admin/payments/${id}/refund`, { reason }),

  // Analytics & Reports
  analytics: () => api.get('/admin/reports/analytics'),
  exportCSV: (type) => api.get(`/admin/reports/export?type=${type}`, { responseType: 'blob' }),

  // Companies & Verification
  companies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id, verified) => api.patch(`/admin/companies/${id}/verify`, { verified }),

  // Jobs Moderation
  jobs: (params) => api.get('/admin/jobs', { params }),
  moderateJob: (id, data) => api.patch(`/admin/jobs/${id}`, data),
  toggleFeaturedJob: (id) => api.patch(`/admin/jobs/${id}/featured`),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),

  // Reports & Flags
  reports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, action, resolution) => api.patch(`/admin/reports/${id}`, { action, resolution }),

  // Staff Roles & Permissions
  roles: (params) => api.get('/admin/roles/staff', { params }),
  updateRole: (id, data) => api.put(`/admin/roles/staff/${id}`, data),
  promoteRole: (data) => api.post('/admin/roles/promote', data),

  // Notifications & Templates
  templates: () => api.get('/admin/notifications/templates'),
  updateTemplate: (id, data) => api.put(`/admin/notifications/templates/${id}`, data),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),

  // Platform Settings
  settings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

const notificationService = {
  list: () => api.get('/notifications'),
  readAll: () => api.post('/notifications/read-all'),
  readOne: (id) => api.patch(`/notifications/${id}/read`),
};

export { authService, jobService, candidateService, recruiterService, adminService, notificationService };
