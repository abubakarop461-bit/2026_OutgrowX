import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LanguageSelector from './components/LanguageSelector';
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import SolarAI from './pages/SolarAI/SolarAI';
import PropertyAssessment from './pages/PropertyAssessment/PropertyAssessment';
import AISolarReport from './pages/AISolarReport/AISolarReport';
import VendorMarketplace from './pages/VendorMarketplace/VendorMarketplace';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboarded, isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isOnboarded, isAuthenticated } = useApp();

  return (
    <>
      {isOnboarded ? <Navbar /> : (
        <div style={{ position: 'absolute', top: '20px', right: '48px', zIndex: 100 }}>
          <LanguageSelector />
        </div>
      )}
      <main style={{ paddingTop: '0px', minHeight: '100vh' }}>
        <Routes>
          {/* Landing role selection */}
          <Route path="/" element={<Landing />} />

          {/* Auth page: Sign in / Sign up with Name, Phone, Email */}
          <Route
            path="/auth"
            element={!isAuthenticated ? <Auth /> : <Navigate to="/onboarding" replace />}
          />

          {/* Onboarding page */}
          <Route
            path="/onboarding"
            element={isAuthenticated ? <Onboarding /> : <Navigate to="/auth" replace />}
          />

          {/* Protected tool pages after onboarding */}
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
