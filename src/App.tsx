"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import PremiumOnboarding from './pages/PremiumOnboarding';
import SelectAllergens from './pages/SelectAllergens';
import SelectLanguages from './pages/SelectLanguages';
import CardPreview from './pages/CardPreview';
import EmergencyCard from './pages/EmergencyCard';
import Settings from './pages/Settings';
import { BillingProvider } from './hooks/useBilling';

function App() {
  return (
    <BillingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/premium-onboarding" element={<PremiumOnboarding />} />
          <Route path="/select-allergens" element={<SelectAllergens />} />
          <Route path="/select-languages" element={<SelectLanguages />} />
          <Route path="/card-preview" element={<CardPreview />} />
          <Route path="/emergency-card" element={<EmergencyCard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </BillingProvider>
  );
}

export default App;