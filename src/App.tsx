"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { BillingProvider } from './hooks/useBilling';
import Index from './pages/Index';
import PremiumOnboarding from './pages/PremiumOnboarding';
import EmergencyPage from './pages/EmergencyPage';

function App() {
  return (
    <BillingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/premium" element={<PremiumOnboarding />} />
          <Route path="/emergency" element={<EmergencyPage />} />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    </BillingProvider>
  );
}

export default App;