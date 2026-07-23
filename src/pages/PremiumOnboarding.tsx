"use client";

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Unlock Premium is now a real slide inside the onboarding carousel (see
// Onboarding.tsx's ONBOARDING_STEPS), not a separate page. This route stays
// in place purely so existing links/deep-links to /premium-onboarding keep
// working - it just forwards into the carousel at that final slide.
const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Forward premiumReturnTo along so the carousel's Unlock Premium step
    // knows where to send the user back to once Premium actually activates -
    // see PremiumOfferStep.
    const premiumReturnTo = (location.state as { premiumReturnTo?: string } | null)?.premiumReturnTo;
    navigate('/onboarding', { replace: true, state: { jumpToEnd: true, premiumReturnTo } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return null;
};

export default PremiumOnboarding;
