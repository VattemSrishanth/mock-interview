import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, BarChart3, Bot, ChevronLeft, ChevronRight, Command, FilePlus2, History, LayoutDashboard, LogOut, Menu, Moon, Settings, Shield, Sun, UserRound, X } from 'lucide-react';

const links = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
  { name: 'New interview', path: '/create', icon: FilePlus2, shortcut: '⌘2' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'History', path: '/history', icon: History, shortcut: '⌘3' },
  { name: 'Profile', path: '/profile', icon: UserRound },
  { name: 'Settings', path: '/settings', icon: Settings },
];
const mono = 'font-mono text-[10px] uppercase tracking-wider';

export default function Sidebar({ onOpenCoach, onCollapsedChange }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLight = theme === 'light';

  if (!isAuthenticated) return <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95"><div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-8"><Link to="/" className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900"><Bot size={16} className="text-orange-400" /></span><span className="font-semibold tracking-tight text-white">Interv<span className="text-orange-400">AI</span></span><span className={`${mono} ml-1 hidden text-zinc-600 sm:inline`}>Engineering workspace</span></Link><div className="flex items-center gap-2"><button onClick={toggleTheme} aria-label="Toggle light and dark theme" className="rounded border border-zinc-800 p-2 text-zinc-400 hover:text-white">{isLight ? <Moon size={15} /> : <Sun size={15} />}</button><Link to="/login" className="px-3 py-2 text-xs text-zinc-400 hover:text-white">Sign in</Link><Link to="/register" className="rounded bg-orange-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-orange-400">Get started</Link></div></div></header>;

  const closeMobile = () => setMobileOpen(false);
  const menuLinks = isAdmin ? [...links, { name: 'Admin', path: '/admin', icon: Shield }] : links;
  return <>
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 md:hidden"><Link to="/dashboard" className="flex items-center gap-2"><Bot size={17} className="text-orange-400" /><span className="font-semibold text-white">IntervAI</span></Link><button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" className="rounded border border-zinc-800 p-2 text-zinc-300">{mobileOpen ? <X size={17} /> : <Menu size={17} />}</button></div>
    {mobileOpen && <button aria-label="Close navigation" onClick={closeMobile} className="fixed inset-0 z-40 bg-black/60 md:hidden" />}
    <aside className={`fixed bottom-0 left-0 top-0 z-50 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ${collapsed ? 'md:w-[76px]' : 'md:w-64'} ${mobileOpen ? 'flex w-64 translate-x-0' : 'hidden -translate-x-full md:flex md:translate-x-0'}`}>
      <div className={`flex h-14 shrink-0 items-center border-b border-zinc-800 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}><Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900"><Bot size={16} className="text-orange-400" /></span>{!collapsed && <span className="font-semibold tracking-tight text-white">Interv<span className="text-orange-400">AI</span></span>}</Link><button onClick={() => { const next = !collapsed; setCollapsed(next); onCollapsedChange?.(next); }} title={collapsed ? 'Expand navigation' : 'Collapse navigation'} className="hidden rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 md:block">{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button></div>
      <Link to="/profile" onClick={closeMobile} className={`mx-3 mt-3 flex items-center gap-2.5 rounded border border-zinc-800 bg-zinc-900/50 p-2 ${collapsed ? 'justify-center' : ''}`} title={user?.name || 'Candidate'}><span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-800 font-mono text-xs text-zinc-200">{(user?.name || 'C').slice(0, 1).toUpperCase()}<i className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-zinc-950 bg-orange-500" /></span>{!collapsed && <span className="min-w-0"><span className="block truncate text-xs font-medium text-zinc-200">{user?.name || 'Candidate'}</span><span className={`${mono} mt-0.5 block text-zinc-500`}>SYS: NOMINAL · READY</span></span>}</Link>
      {!collapsed && <div className="px-4 pb-1 pt-4"><p className={`${mono} text-zinc-600`}>Workspace</p></div>}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">{menuLinks.map(({ name, path, icon: Icon, shortcut }) => { const active = location.pathname === path || (path === '/interviews' && location.pathname.startsWith(path)); return <Link key={path} to={path} onClick={closeMobile} title={collapsed ? name : undefined} className={`flex items-center gap-2.5 rounded px-2.5 py-2.5 text-xs transition ${collapsed ? 'justify-center' : ''} ${active ? 'border border-orange-500/20 bg-orange-500/10 text-orange-300' : 'border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'}`}><Icon size={15} className="shrink-0" />{!collapsed && <><span className="flex-1">{name}</span>{shortcut && <kbd className="rounded border border-zinc-800 px-1 py-0.5 font-mono text-[9px] text-zinc-600">{shortcut}</kbd>}</>}</Link>; })}</nav>
      <div className="space-y-1 border-t border-zinc-800 p-3"><button onClick={() => { onOpenCoach?.(); closeMobile(); }} className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 ${collapsed ? 'justify-center' : ''}`} title="Career coach"><Command size={15} />{!collapsed && 'Career coach'}</button><button onClick={toggleTheme} className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 ${collapsed ? 'justify-center' : ''}`} title={`Switch to ${isLight ? 'dark' : 'light'} theme`}>{isLight ? <Moon size={15} /> : <Sun size={15} />}{!collapsed && <><span className="flex-1 text-left">Appearance</span><span className="flex h-4 w-7 items-center rounded-sm border border-zinc-700 bg-zinc-900 p-0.5"><i className={`h-2.5 w-2.5 bg-orange-500 transition-transform ${isLight ? 'translate-x-3' : ''}`} /></span></>}</button><button onClick={() => { logout(); navigate('/'); }} className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2.5 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 ${collapsed ? 'justify-center' : ''}`}><LogOut size={15} />{!collapsed && 'Sign out'}</button><div className={`flex items-center gap-2 px-2.5 pt-2 text-zinc-600 ${collapsed ? 'justify-center' : ''}`}><Activity size={12} className="text-orange-500" />{!collapsed && <span className={mono}>Local session</span>}</div></div>
    </aside>
  </>;
}
