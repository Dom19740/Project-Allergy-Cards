"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import SelectAllergens from './pages/SelectAllergens';
import SelectLanguages from './pages/SelectLanguages';
import CardPreview from './pages/CardPreview';
import EmergencyCard from './pages/EmergencyCard';
import UnlockPremium from './pages/UnlockPremium';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/select-allergens" element={<SelectAllergens />} />
        <Route path="/select-languages" element={<SelectLanguages />} />
        <Route path="/card-preview" element={<CardPreview />} />
        <Route path="/emergency-card" element={<EmergencyCard />} />
        <Route path="/unlock-premium" element={<UnlockPremium />} />
      </Routes>
    </Router>
  );
}

export default App;