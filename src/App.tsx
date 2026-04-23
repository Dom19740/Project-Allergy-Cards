"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import PremiumOnboarding from './pages/PremiumOnboarding';
import PromoCode from './pages/PromoCode';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/premium" element={<PremiumOnboarding />} />
        <Route path="/promo" element={<PromoCode />} />
      </Routes>
    </Router>
  );
}

export default App;