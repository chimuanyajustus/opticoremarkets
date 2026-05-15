import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/portfolio', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: Shield },
    { name: 'User Management', path: '/admin/users', icon: Shield },
    { name: 'Investments', path: '/admin/investments', icon: Sparkles },
  ];

  return (
    <div className="min-vh-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-white/20">
          <Logo />
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="border-t border-white/20 my-4"></div>
                <div className="px-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 h-16 flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 md:flex-initial">
            <h1 className="text-xl font-semibold text-white">Opticore Markets</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-300">Welcome back</div>
              <div className="text-sm font-medium text-white">{user?.displayName || user?.email}</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;