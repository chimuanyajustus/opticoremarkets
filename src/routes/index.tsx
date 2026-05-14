import { createHashRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import SettingsPage from '../pages/SettingsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import PortfolioPage from '../pages/PortfolioPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminInvestmentsPage from '../pages/admin/AdminInvestmentsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import PublicRoute from '../components/PublicRoute';
import NavigationLoader from '../components/NavigationLoader';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <NavigationLoader />
    {children}
  </>
);

export const router = createHashRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <LandingPage />
      </RootLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <RootLayout>
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </RootLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <RootLayout>
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      </RootLayout>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <RootLayout>
        <VerifyEmailPage />
      </RootLayout>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/portfolio',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <PortfolioPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/analytics',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/admin',
    element: (
      <RootLayout>
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      </RootLayout>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RootLayout>
        <AdminRoute>
          <AdminUsersPage />
        </AdminRoute>
      </RootLayout>
    ),
  },
  {
    path: '/admin/investments',
    element: (
      <RootLayout>
        <AdminRoute>
          <AdminInvestmentsPage />
        </AdminRoute>
      </RootLayout>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <RootLayout>
        <AdminRoute>
          <AdminAnalyticsPage />
        </AdminRoute>
      </RootLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <RootLayout>
        <ForgotPasswordPage />
      </RootLayout>
    ),
  },
  {
    path: '/terms',
    element: (
      <RootLayout>
        <TermsPage />
      </RootLayout>
    ),
  },
  {
    path: '/privacy',
    element: (
      <RootLayout>
        <PrivacyPage />
      </RootLayout>
    ),
  },
]);