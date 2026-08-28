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

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const isRetried = window.sessionStorage.getItem('chunk_retry') === 'true';
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('chunk_retry', 'false');
      return component;
    } catch (error) {
      if (!isRetried) {
        window.sessionStorage.setItem('chunk_retry', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

const LoginPage = lazyWithRetry(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/auth/VerifyEmailPage'));
const JobsPage = lazyWithRetry(() => import('./pages/JobsPage'));
const JobDetailPage = lazyWithRetry(() => import('./pages/JobDetailPage'));
const RecommendedJobsPage = lazyWithRetry(() => import('./pages/RecommendedJobsPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));

const ResumeAnalyzerPage = lazyWithRetry(() => import('./pages/candidate/ResumeAnalyzerPage'));
const CareerNewsPage = lazyWithRetry(() => import('./pages/CareerNewsPage'));
const TrendingKeywordPage = lazyWithRetry(() => import('./pages/TrendingKeywordPage'));
const TrendingKeywordsHubPage = lazyWithRetry(() => import('./pages/TrendingKeywordsHubPage'));

const CandidateDashboardPage = lazyWithRetry(() => import('./pages/candidate/CandidateDashboardPage'));
const CandidateProfilePage = lazyWithRetry(() => import('./pages/candidate/CandidateProfilePage'));
const SavedJobsPage = lazyWithRetry(() => import('./pages/candidate/SavedJobsPage'));
const MyApplicationsPage = lazyWithRetry(() => import('./pages/candidate/MyApplicationsPage'));
const ResumeUploadPage = lazyWithRetry(() => import('./pages/candidate/ResumeUploadPage'));

const RecruiterDashboardPage = lazyWithRetry(() => import('./pages/recruiter/RecruiterDashboardPage'));
const CompanyProfilePage = lazyWithRetry(() => import('./pages/recruiter/CompanyProfilePage'));
const PostJobPage = lazyWithRetry(() => import('./pages/recruiter/PostJobPage'));
const EditJobPage = lazyWithRetry(() => import('./pages/recruiter/EditJobPage'));
const MyJobsPage = lazyWithRetry(() => import('./pages/recruiter/MyJobsPage'));
const ApplicantsPage = lazyWithRetry(() => import('./pages/recruiter/ApplicantsPage'));

const AdminDashboardPage = lazyWithRetry(() => import('./pages/admin/AdminDashboardPage'));
const AdminLoginPage = lazyWithRetry(() => import('./pages/admin/AdminLoginPage'));
const AdminServicesPage = lazyWithRetry(() => import('./pages/admin/AdminServicesPage'));
const AdminPlansPage = lazyWithRetry(() => import('./pages/admin/AdminPlansPage'));
const AdminCouponsPage = lazyWithRetry(() => import('./pages/admin/AdminCouponsPage'));
const AdminBundlesPage = lazyWithRetry(() => import('./pages/admin/AdminBundlesPage'));
const AdminUsersPage = lazyWithRetry(() => import('./pages/admin/AdminUsersPage'));
const AdminCompaniesPage = lazyWithRetry(() => import('./pages/admin/AdminCompaniesPage'));
const AdminJobsPage = lazyWithRetry(() => import('./pages/admin/AdminJobsPage'));
const AdminPaymentsPage = lazyWithRetry(() => import('./pages/admin/AdminPaymentsPage'));
const AdminAnalyticsPage = lazyWithRetry(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminRolesPage = lazyWithRetry(() => import('./pages/admin/AdminRolesPage'));
const AdminNotificationsPage = lazyWithRetry(() => import('./pages/admin/AdminNotificationsPage'));
const AdminSettingsPage = lazyWithRetry(() => import('./pages/admin/AdminSettingsPage'));
const AdminReportsPage = lazyWithRetry(() => import('./pages/admin/AdminReportsPage'));
const AdminICardStudioPage = lazyWithRetry(() => import('./pages/admin/AdminICardStudioPage'));
const VerifyCardPage = lazyWithRetry(() => import('./pages/public/VerifyCardPage'));

const CandidatePortfolioPage = lazyWithRetry(() => import('./pages/candidate/CandidatePortfolioPage'));
const PublicPortfolioPage = lazyWithRetry(() => import('./pages/PublicPortfolioPage'));

const withSuspense = (el) => <ErrorBoundary><Suspense fallback={<PageLoader />}>{el}</Suspense></ErrorBoundary>;

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <JobProvider>
        <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          <Route path="/portfolio/:slug" element={withSuspense(<PublicPortfolioPage />)} />
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
            <Route path="/jobs/keyword/:slug" element={withSuspense(<TrendingKeywordPage />)} />
            <Route path="/trending-jobs/:slug" element={withSuspense(<TrendingKeywordPage />)} />
            <Route path="/trending-keywords" element={withSuspense(<TrendingKeywordsHubPage />)} />
            <Route path="/trending-jobs" element={withSuspense(<TrendingKeywordsHubPage />)} />
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
              <Route path="/candidate/portfolio" element={withSuspense(<CandidatePortfolioPage />)} />
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
