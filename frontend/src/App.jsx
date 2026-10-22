import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AiCoachDrawer from './components/AiCoachDrawer';
import { useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateInterviewPage = lazy(() => import('./pages/CreateInterviewPage'));
const InterviewLobbyPage = lazy(() => import('./pages/InterviewLobbyPage'));
const LiveInterviewPage = lazy(() => import('./pages/LiveInterviewPage'));
const InterviewResultPage = lazy(() => import('./pages/InterviewResultPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PublicInterviewReportPage = lazy(() => import('./pages/PublicInterviewReportPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <span className="h-5 w-5 animate-spin border-2 border-zinc-700 border-t-orange-500" />
    </div>
  );
}

export default function App() {
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-400">
      <Sidebar onOpenCoach={() => setIsCoachOpen(true)} onCollapsedChange={setSidebarCollapsed} />

      {/* Main Content Area: adjusts margin when authenticated user views with sidebar */}
      <div className={`flex min-h-screen flex-col ${isAuthenticated ? (sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-64') : ''}`}>
        <main className="app-main flex-grow">
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/report/:shareToken" element={<PublicInterviewReportPage />} />

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
                <SettingsPage />
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
        </Suspense>
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
