import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AiCoachDrawer from './components/AiCoachDrawer';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateInterviewPage from './pages/CreateInterviewPage';
import InterviewLobbyPage from './pages/InterviewLobbyPage';
import LiveInterviewPage from './pages/LiveInterviewPage';
import InterviewResultPage from './pages/InterviewResultPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 selection:bg-brand-500/30 selection:text-brand-400">
      <Sidebar onOpenCoach={() => setIsCoachOpen(true)} />
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-20 z-30 rounded-full border border-white/10 bg-slate-900/80 p-2 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-800 hover:text-white"
        title={`Change theme (current: ${theme})`}
        aria-label={`Change theme (current: ${theme})`}
      >
        {isLight ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
      </button>

      {/* Main Content Area: adjusts margin when authenticated user views with sidebar */}
      <div className={`flex flex-col min-h-screen ${isAuthenticated ? 'md:pl-64 transition-all duration-300' : ''}`}>
        <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Candidate Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenCoach={() => setIsCoachOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:id/lobby"
            element={
              <ProtectedRoute>
                <InterviewLobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:id/live"
            element={
              <ProtectedRoute>
                <LiveInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:id"
            element={
              <ProtectedRoute>
                <LiveInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/:id/result"
            element={
              <ProtectedRoute>
                <InterviewResultPage onOpenCoach={() => setIsCoachOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      </div>

      {/* Global AI Career Coach Drawer */}
      <AiCoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
      />
    </div>
  );
}
