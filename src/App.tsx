import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing/Landing';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import SolarAI from './pages/SolarAI/SolarAI';
import PropertyAssessment from './pages/PropertyAssessment/PropertyAssessment';
import AISolarReport from './pages/AISolarReport/AISolarReport';
import VendorMarketplace from './pages/VendorMarketplace/VendorMarketplace';

function AppRoutes() {
  const { isOnboarded } = useApp();

  return (
    <>
      {isOnboarded && <Navbar />}
      <main style={{ paddingTop: isOnboarded ? '64px' : '0', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={!isOnboarded ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={isOnboarded ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/solar-ai" element={isOnboarded ? <SolarAI /> : <Navigate to="/" />} />
          <Route path="/property" element={isOnboarded ? <PropertyAssessment /> : <Navigate to="/" />} />
          <Route path="/report" element={isOnboarded ? <AISolarReport /> : <Navigate to="/" />} />
          <Route path="/marketplace" element={isOnboarded ? <VendorMarketplace /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
