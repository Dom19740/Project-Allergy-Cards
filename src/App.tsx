"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import PremiumOnboarding from './pages/PremiumOnboarding';
import AllergenSelectionPage from './pages/AllergenSelectionPage';
import SelectAlertPage from './pages/SelectAlertPage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import AllergyAlertPage from './pages/AllergyAlertPage';
import EmergencyPage from './pages/EmergencyPage';
import NotFound from './pages/NotFound';
import { BillingProvider } from './hooks/useBilling';
import { Toaster } from 'sonner';

function App() {
  return (
    <BillingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/premium-onboarding" element={<PremiumOnboarding />} />
          <Route path="/select-allergens" element={<AllergenSelectionPage />} />
          <Route path="/select-alert" element={<SelectAlertPage />} />
          <Route path="/select-language" element={<LanguageSelectionPage />} />
          <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
          <Route path="/emergency/:langCode" element={<EmergencyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </BillingProvider>
  );
}

export default App;