import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Zap, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'How it Works', href: '/how-it-works' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center btn-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Yugo<span className="gradient-text">2</span>Market
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-bg rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-white/5">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center avatar-glow">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-strong border-white/10" align="end">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{user?.name}</span>
                        <span className="text-xs text-white/50">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer text-white/80 hover:text-white hover:bg-white/5">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile" className="cursor-pointer text-white/80 hover:text-white hover:bg-white/5">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-white/80 hover:text-white hover:bg-white/5">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 rounded-full px-6">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="gradient-bg text-white border-0 rounded-full px-6 btn-glow hover:scale-105 transition-transform">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/[0.06]">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated ? (
                <div className="pt-3 space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full border-white/20 text-white">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full gradient-bg text-white rounded-full">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-3 space-y-2">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full border-white/20 text-white">Dashboard</Button>
                  </Link>
                  <Button variant="destructive" className="w-full rounded-full" onClick={logout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Yugo<span className="gradient-text">2</span>Market
                </span>
              </Link>
              <p className="text-white/50 text-sm max-w-sm">
                The #1 Local Influencer Network. Connect with local influencers to amplify your brand and reach your target audience effectively.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/marketplace" className="text-sm text-white/50 hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How it Works</Link></li>
                <li><Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-sm text-white/50 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-sm text-white/50">support@yugo2market.com</li>
                <li className="text-sm text-white/50">+91 123 456 7890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Yugo2Market. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
