import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InfluencerProvider } from './context/InfluencerContext';
import { GameProvider } from './context/GameContext';
import { VoiceProvider } from './context/VoiceContext';
import HomePage from './pages/HomePage';
import TeleportPage from './pages/TeleportPage';
import RankingPage from './pages/RankingPage';
import ExperiencePage from './pages/ExperiencePage';
import CompletionPage from './pages/CompletionPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import CompanySelectionPage from './pages/admin/CompanySelectionPage';
import ConfigDashboard from './pages/admin/ConfigDashboard';
import DestinationLoginPage from './pages/admin/DestinationLoginPage';
import DestinationDashboard from './pages/admin/DestinationDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <InfluencerProvider>
        <GameProvider>
        <VoiceProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/destination-login" element={<DestinationLoginPage />} />
              <Route path="/admin/destination-dashboard" element={<DestinationDashboard />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="companies" element={<CompanySelectionPage />} />
                <Route path="config" element={<ConfigDashboard />} />
                <Route index element={<Navigate to="companies" replace />} />
              </Route>

              {/* Public Routes */}
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/teleport" element={<TeleportPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/experience/:id" element={<ExperiencePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/completion" element={<CompletionPage />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </Router>
        </VoiceProvider>
      </GameProvider>
    </InfluencerProvider>
    </ErrorBoundary>
  );
}

export default App;
