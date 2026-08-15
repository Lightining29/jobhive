import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
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
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  companies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id, verified) => api.patch(`/admin/companies/${id}/verify`, { verified }),
  jobs: (params) => api.get('/admin/jobs', { params }),
  moderateJob: (id, data) => api.patch(`/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  reports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, action, resolution) => api.patch(`/admin/reports/${id}`, { action, resolution }),
};

const notificationService = {
  list: () => api.get('/notifications'),
  readAll: () => api.post('/notifications/read-all'),
  readOne: (id) => api.patch(`/notifications/${id}/read`),
};

export { authService, jobService, candidateService, recruiterService, adminService, notificationService };
