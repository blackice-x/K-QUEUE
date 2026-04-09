/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import QueuePage from './pages/QueuePage';
import LobbyPage from './pages/LobbyPage';
import TeamPage from './pages/TeamPage';
import LeaderboardPage from './pages/LeaderboardPage';
import GamingDashboard from './pages/GamingDashboard';
import Support from './pages/Support';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoadingScreen from './components/ui/LoadingScreen';
import BackgroundMusic from './components/layout/BackgroundMusic';
import ErrorBoundary from './components/ErrorBoundary';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/queue" element={user ? <QueuePage /> : <Navigate to="/" />} />
      <Route path="/lobbies" element={user ? <LobbyPage /> : <Navigate to="/" />} />
      <Route path="/teams" element={user ? <TeamPage /> : <Navigate to="/" />} />
      <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/" />} />
      <Route path="/ecosystem" element={user ? <GamingDashboard /> : <Navigate to="/" />} />
      <Route path="/support" element={user ? <Support /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="dark min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <AppRoutes />
            <BackgroundMusic />
            <Toaster position="top-right" theme="dark" />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

