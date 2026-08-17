import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layouts/MainLayout';
import { ProtectedRoute, GuestRoute } from './components/routes/ProtectedRoute';
import { PageLoader } from './components/ui/States';
import ErrorBoundary from './components/ui/ErrorBoundary';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const RecommendedJobsPage = lazy(() => import('./pages/RecommendedJobsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

const ResumeAnalyzerPage = lazy(() => import('./pages/candidate/ResumeAnalyzerPage'));
const CareerNewsPage = lazy(() => import('./pages/CareerNewsPage'));

const CandidateDashboardPage = lazy(() => import('./pages/candidate/CandidateDashboardPage'));
const CandidateProfilePage = lazy(() => import('./pages/candidate/CandidateProfilePage'));
const SavedJobsPage = lazy(() => import('./pages/candidate/SavedJobsPage'));
const MyApplicationsPage = lazy(() => import('./pages/candidate/MyApplicationsPage'));
const ResumeUploadPage = lazy(() => import('./pages/candidate/ResumeUploadPage'));

const RecruiterDashboardPage = lazy(() => import('./pages/recruiter/RecruiterDashboardPage'));
const CompanyProfilePage = lazy(() => import('./pages/recruiter/CompanyProfilePage'));
const PostJobPage = lazy(() => import('./pages/recruiter/PostJobPage'));
const EditJobPage = lazy(() => import('./pages/recruiter/EditJobPage'));
const MyJobsPage = lazy(() => import('./pages/recruiter/MyJobsPage'));
const ApplicantsPage = lazy(() => import('./pages/recruiter/ApplicantsPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminPlansPage = lazy(() => import('./pages/admin/AdminPlansPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminBundlesPage = lazy(() => import('./pages/admin/AdminBundlesPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCompaniesPage = lazy(() => import('./pages/admin/AdminCompaniesPage'));
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminRolesPage = lazy(() => import('./pages/admin/AdminRolesPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminICardStudioPage = lazy(() => import('./pages/admin/AdminICardStudioPage'));
const VerifyCardPage = lazy(() => import('./pages/public/VerifyCardPage'));

const withSuspense = (el) => <ErrorBoundary><Suspense fallback={<PageLoader />}>{el}</Suspense></ErrorBoundary>;

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <JobProvider>
        <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={withSuspense(<HomePage />)} />
            <Route path="/jobs" element={withSuspense(<JobsPage />)} />
            <Route path="/jobs/technical" element={withSuspense(<JobsPage key="technical" />)} />
            <Route path="/jobs/non-technical" element={withSuspense(<JobsPage key="non-technical" />)} />
            <Route path="/jobs/remote" element={withSuspense(<JobsPage key="remote" />)} />
            <Route path="/jobs/hybrid" element={withSuspense(<JobsPage key="hybrid" />)} />
            <Route path="/jobs/onsite" element={withSuspense(<JobsPage key="onsite" />)} />
            <Route path="/jobs/recommended" element={withSuspense(<RecommendedJobsPage />)} />
            <Route path="/jobs/:id" element={withSuspense(<JobDetailPage />)} />
            <Route path="/about" element={withSuspense(<AboutPage />)} />
            <Route path="/career-news" element={withSuspense(<CareerNewsPage />)} />

            <Route path="/admin/login" element={withSuspense(<AdminLoginPage />)} />

            <Route element={<GuestRoute />}>
              <Route path="/auth/login" element={withSuspense(<LoginPage />)} />
              <Route path="/auth/register" element={withSuspense(<RegisterPage />)} />
              <Route path="/auth/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />
              <Route path="/auth/reset-password" element={withSuspense(<ResetPasswordPage />)} />
              <Route path="/auth/verify-email" element={withSuspense(<VerifyEmailPage />)} />
              <Route path="/auth/verify-otp" element={withSuspense(<VerifyEmailPage />)} />
            </Route>

            <Route element={<ProtectedRoute roles={['candidate']} />}>
              <Route path="/candidate/dashboard" element={withSuspense(<CandidateDashboardPage />)} />
              <Route path="/candidate/profile" element={withSuspense(<CandidateProfilePage />)} />
              <Route path="/candidate/recommended" element={withSuspense(<RecommendedJobsPage />)} />
              <Route path="/candidate/saved-jobs" element={withSuspense(<SavedJobsPage />)} />
              <Route path="/candidate/applications" element={withSuspense(<MyApplicationsPage />)} />
              <Route path="/candidate/resume" element={withSuspense(<ResumeUploadPage />)} />
              <Route path="/candidate/resume/analyze" element={withSuspense(<ResumeAnalyzerPage />)} />
            </Route>

            <Route element={<ProtectedRoute roles={['recruiter']} />}>
              <Route path="/recruiter/dashboard" element={withSuspense(<RecruiterDashboardPage />)} />
              <Route path="/recruiter/company" element={withSuspense(<CompanyProfilePage />)} />
              <Route path="/recruiter/post-job" element={withSuspense(<PostJobPage />)} />
              <Route path="/recruiter/my-jobs" element={withSuspense(<MyJobsPage />)} />
              <Route path="/recruiter/my-jobs/:id/edit" element={withSuspense(<EditJobPage />)} />
              <Route path="/recruiter/applications" element={withSuspense(<ApplicantsPage />)} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={withSuspense(<AdminDashboardPage />)} />
              <Route path="/admin/dashboard" element={withSuspense(<AdminDashboardPage />)} />
              <Route path="/admin/icards" element={withSuspense(<AdminICardStudioPage />)} />
              <Route path="/admin/icard-generator" element={withSuspense(<AdminICardStudioPage />)} />
              <Route path="/admin/services" element={withSuspense(<AdminServicesPage />)} />
              <Route path="/admin/plans" element={withSuspense(<AdminPlansPage />)} />
              <Route path="/admin/coupons" element={withSuspense(<AdminCouponsPage />)} />
              <Route path="/admin/bundles" element={withSuspense(<AdminBundlesPage />)} />
              <Route path="/admin/users" element={withSuspense(<AdminUsersPage />)} />
              <Route path="/admin/jobs" element={withSuspense(<AdminJobsPage />)} />
              <Route path="/admin/companies" element={withSuspense(<AdminCompaniesPage />)} />
              <Route path="/admin/payments" element={withSuspense(<AdminPaymentsPage />)} />
              <Route path="/admin/analytics" element={withSuspense(<AdminAnalyticsPage />)} />
              <Route path="/admin/roles" element={withSuspense(<AdminRolesPage />)} />
              <Route path="/admin/notifications" element={withSuspense(<AdminNotificationsPage />)} />
              <Route path="/admin/settings" element={withSuspense(<AdminSettingsPage />)} />
              <Route path="/admin/reports" element={withSuspense(<AdminReportsPage />)} />
            </Route>

            <Route path="/verify-card/:id" element={withSuspense(<VerifyCardPage />)} />
            <Route path="/verify/:id" element={withSuspense(<VerifyCardPage />)} />
            <Route path="/notifications" element={withSuspense(<NotificationsPage />)} />
            <Route path="/career-news" element={withSuspense(<CareerNewsPage />)} />
            <Route path="*" element={withSuspense(<NotFoundPage />)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </JobProvider>
  </AuthProvider>
</ThemeProvider>
);

export default App;
