import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Briefcase,
  CreditCard,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Briefcase },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop - Glass */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/[0.06] bg-black/20 backdrop-blur-xl">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'gradient-bg text-white shadow-lg shadow-creator-pink/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl glass mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 avatar-glow">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/[0.06] transform transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Dashboard</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-8 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'gradient-bg text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center justify-between px-4 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-bold text-white">Dashboard</span>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto relative">
          <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
