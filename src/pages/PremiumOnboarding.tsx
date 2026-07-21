"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Unlock Premium is now a real slide inside the onboarding carousel (see
// Onboarding.tsx's ONBOARDING_STEPS), not a separate page. This route stays
// in place purely so existing links/deep-links to /premium-onboarding keep
// working - it just forwards into the carousel at that final slide.
const PremiumOnboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/onboarding', { replace: true, state: { jumpToEnd: true } });
  }, [navigate]);

  return null;
};

export default PremiumOnboarding;
