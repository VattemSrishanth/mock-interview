import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  LayoutDashboard,
  PlayCircle,
  BarChart3,
  History,
  User,
  ShieldAlert,
  Sparkles,
  Flame,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  Settings,
} from 'lucide-react';

export default function Sidebar({ onOpenCoach }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice', path: '/create', icon: PlayCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
  }

  const isActive = (path) => location.pathname === path;

  // On public pages (landing, login, register) without authentication, render a sleek floating header
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition duration-300">
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
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-md shadow-brand-500/20 transition active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Mobile Top App Bar with hamburger */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-[#090d16]/90 border-b border-white/5 backdrop-blur-xl">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5">
            <div className="w-full h-full bg-[#0d1322] rounded-[6px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Interview <span className="text-brand-400">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCoach}
            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs"
            title="Open AI Career Coach"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/5"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#070b14]/95 border-r border-white/5 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 overflow-hidden transition-all ${
              collapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            {!collapsed && (
              <div className="whitespace-nowrap">
                <span className="text-lg font-bold tracking-tight text-white">
                  Interview <span className="text-brand-400">AI</span>
                </span>
                <span className="block text-[9px] uppercase font-semibold tracking-wider text-slate-400">
                  Engineering Platform
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle Bar */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-b border-white/5">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Card Pill */}
        <div className={`p-3 border-b border-white/5 shrink-0 ${collapsed ? 'text-center' : ''}`}>
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 p-2 rounded-xl bg-[#0d1322] border border-white/5 hover:border-brand-500/40 hover:bg-[#11192e] transition group ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-9 h-9 rounded-full border border-brand-500/40 bg-slate-800 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-semibold text-white group-hover:text-brand-300 truncate leading-tight">
                  {user?.name || 'Candidate'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.targetRole || 'Software Engineer'}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Streak & Status Highlights (Expanded Only) */}
        {!collapsed && (
          <div className="px-4 py-3 shrink-0">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                <span>Daily Practice Streak</span>
              </div>
              <span className="text-xs font-bold text-amber-300">
                {user?.interviewStreak || 0}d
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  active
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom AI Coach Trigger & Signout */}
        <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenCoach();
            }}
            title={collapsed ? 'AI Career Coach' : undefined}
            className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 transition text-xs font-semibold shadow-sm ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            {!collapsed && <span>AI Career Advisor</span>}
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs font-medium ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

