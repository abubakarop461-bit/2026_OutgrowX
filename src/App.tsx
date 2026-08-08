import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Landing from './pages/Landing/Landing';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import SolarAI from './pages/SolarAI/SolarAI';
import PropertyAssessment from './pages/PropertyAssessment/PropertyAssessment';
import AISolarReport from './pages/AISolarReport/AISolarReport';
import VendorMarketplace from './pages/VendorMarketplace/VendorMarketplace';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useApp();
  if (!isOnboarded) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isOnboarded } = useApp();

  return (
    <>
      {isOnboarded && <Navbar />}
      <main style={{ paddingTop: isOnboarded ? '64px' : '0', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={!isOnboarded ? <Landing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/solar-ai" element={<ProtectedRoute><SolarAI /></ProtectedRoute>} />
          <Route path="/property" element={<ProtectedRoute><PropertyAssessment /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><AISolarReport /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><VendorMarketplace /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}
