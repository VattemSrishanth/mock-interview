import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AiCoachDrawer from './components/AiCoachDrawer';

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

  return (
    <div className="flex flex-col min-h-screen bg-[#080c15] text-slate-100 selection:bg-brand-500/30 selection:text-brand-400">
      <Navbar onOpenCoach={() => setIsCoachOpen(true)} />

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

      {/* Global AI Career Coach Drawer */}
      <AiCoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
      />
    </div>
  );
}
