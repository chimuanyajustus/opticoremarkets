import { createHashRouter, Navigate, Outlet, Link, useRouteError } from 'react-router-dom';
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

const RootLayout = () => (
  <>
    <NavigationLoader />
    <Outlet />
  </>
);

const RouteErrorPage: React.FC = () => {
  const error = useRouteError();

  return (
    <div className="min-vh-screen flex items-center justify-center bg-slate-950 text-white px-4 py-12">
      <div className="max-w-xl w-full rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold mb-4">Navigation error</h1>
        <p className="text-gray-300 mb-4">
          Something went wrong while rendering this page. Please refresh the browser or return to the homepage.
        </p>
        <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words">{String(error)}</pre>
        <div className="mt-6 text-right">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/portfolio',
        element: (
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/analytics',
        element: (
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/investments',
        element: (
          <AdminRoute>
            <AdminInvestmentsPage />
          </AdminRoute>
        ),
      },
      {
        path: '/admin/analytics',
        element: (
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/terms',
        element: <TermsPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);