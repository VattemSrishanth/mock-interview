import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare,
  Flame, 
  BarChart3, 
  History, 
  ShieldAlert, 
  User, 
  LogOut, 
  PlayCircle, 
  Bot,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ onOpenCoach }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Practice', path: '/create', icon: PlayCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition duration-300">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-400 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Interview <span className="text-brand-400">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded">
                PRO AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold" title="Consecutive Practice Streak">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{user?.interviewStreak || 0} Day Streak</span>
                </div>

                {/* AI Coach Trigger */}
                <button
                  onClick={onOpenCoach}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>AI Career Coach</span>
                </button>

                {/* User Pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 hover:opacity-80 transition group"
                    title="View & Edit Profile"
                  >
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full border border-brand-500/40 bg-slate-800 group-hover:border-brand-400"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-white group-hover:text-brand-300 leading-tight transition">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user?.targetRole || 'Candidate'}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-lg shadow-brand-500/25 transition active:scale-95"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={onOpenCoach}
                className="p-2 text-indigo-400 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/5 bg-[#0d1322]/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-white/10">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border border-brand-500/40"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5"
                  >
                    <Icon className="w-4 h-4 text-brand-400" />
                    {link.name}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg border border-white/10 text-white font-medium text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg bg-brand-500 text-slate-950 font-semibold text-sm"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
