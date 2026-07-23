"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Check, Languages, ShieldAlert, MessageSquare, Save, Smartphone } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import StepHeader from '@/components/StepHeader';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import RestorePurchaseDialog from '@/components/RestorePurchaseDialog';
import { getPremiumPrice, resetPremiumCacheForTesting } from '@/lib/billing';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const DEV_RESET_TAPS_REQUIRED = 3;
const DEV_RESET_TAP_WINDOW_MS = 2000;

const benefits = [
  { icon: Languages, title: "100+ Languages" },
  { icon: ShieldAlert, title: "Custom Allergens" },
  { icon: MessageSquare, title: "Custom Alerts" },
  { icon: Save, title: "Save Multiple Cards" },
  { icon: Smartphone, title: "Home Screen Widget", note: "(Android Only)" },
];

interface PremiumOfferStepProps {
  // Wherever the user was before being sent here to unlock Premium (e.g. the
  // allergen or language screen) - once Premium actually activates while
  // they're looking at this step, send them straight back there instead of
  // leaving them stranded on the onboarding carousel.
  returnTo?: string;
}

// The content of the "Unlock Premium" onboarding step - shared between the
// carousel slide (OnboardingStep) and the standalone /premium-onboarding
// route, which now just redirects into the carousel at this step.
const PremiumOfferStep: React.FC<PremiumOfferStepProps> = ({ returnTo }) => {
  const navigate = useNavigate();
  const { purchasePremium, isPremium } = useBilling();
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [price, setPrice] = useState('Loading...');
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const devTapCount = useRef(0);
  const devTapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPremiumRef = useRef(isPremium);

  // Fires only on the false -> true transition while this step is mounted -
  // not on initial mount, so swiping through onboarding while already
  // Premium doesn't unexpectedly bounce the user away from the carousel.
  useEffect(() => {
    if (!wasPremiumRef.current && isPremium && returnTo) {
      navigate(returnTo);
    }
    wasPremiumRef.current = isPremium;
  }, [isPremium, returnTo, navigate]);

  // Hidden testing affordance: tap the crown icon 3x quickly to clear the
  // locally cached premium flag, without adb/bmgr gymnastics.
  const handleDevResetTap = () => {
    devTapCount.current += 1;
    if (devTapResetTimer.current) clearTimeout(devTapResetTimer.current);
    devTapResetTimer.current = setTimeout(() => {
      devTapCount.current = 0;
    }, DEV_RESET_TAP_WINDOW_MS);

    if (devTapCount.current >= DEV_RESET_TAPS_REQUIRED) {
      devTapCount.current = 0;
      resetPremiumCacheForTesting();
      toast.info('Premium cache cleared (testing)');
    }
  };

  useEffect(() => {
    // Poll until the store has loaded the product
    const interval = setInterval(() => {
      const p = getPremiumPrice();
      if (p && p !== 'Loading...') {
        setPrice(p);
        clearInterval(interval);
      }
    }, 500);

    // Also set initial price if available
    const initialPrice = getPremiumPrice();
    if (initialPrice) setPrice(initialPrice);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center text-center space-y-4">
      <StepHeader
        title={
          <span className="inline-flex items-center gap-1">
            <span
              onClick={handleDevResetTap}
              className="inline-flex bg-amber-100 dark:bg-amber-900/30 p-1 rounded-lg cursor-pointer"
            >
              <Crown className="h-4 w-4 text-amber-600 fill-amber-600/20" />
            </span>
            {isPremium ? "Premium Unlocked" : "Unlock Premium"}
          </span>
        }
        description={isPremium
          ? "You have full access to all features. Travel with total peace of mind."
          : "Get the full power of Simple Allergy Alert and travel with total peace of mind."}
      />

      <div className="w-full space-y-2">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 py-2 px-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left shadow-sm"
          >
            <benefit.icon className="h-4 w-4 text-red-600 shrink-0" />
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                {benefit.title}
                {benefit.note && <> <span className="whitespace-nowrap">{benefit.note}</span></>}
              </h3>
            </div>
            <Check className="h-3 w-3 text-green-500 shrink-0" />
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col gap-3">
        {!isPremium && (
          <Button
            onClick={purchasePremium}
            className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            {Capacitor.getPlatform() === 'web'
              ? 'One-time payment of $2.99'
              : (price === 'Loading...' ? 'Loading Price...' : `One-time payment of ${price}`)}
          </Button>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIsPromoOpen(true)}
            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest transition-colors py-0.5"
          >
            Redeem Promo Code
          </button>

          {Capacitor.getPlatform() === 'web' && !isPremium && (
            <button
              onClick={() => setIsRestoreOpen(true)}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest transition-colors py-0.5"
            >
              Restore Web Purchase
            </button>
          )}
        </div>
      </div>

      <PromoCodeDialog
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        onSuccess={() => {
          // Success logic is handled inside the dialog
        }}
      />

      <RestorePurchaseDialog isOpen={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} />
    </div>
  );
};

export default PremiumOfferStep;
