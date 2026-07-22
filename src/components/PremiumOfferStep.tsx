"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Check, Languages, ShieldAlert, MessageSquare, Save, Smartphone, Loader2 } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import StepHeader from '@/components/StepHeader';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import { getPremiumPrice, resetPremiumCacheForTesting } from '@/lib/billing';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
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

// The content of the "Unlock Premium" onboarding step - shared between the
// carousel slide (OnboardingStep) and the standalone /premium-onboarding
// route, which now just redirects into the carousel at this step.
const PremiumOfferStep = () => {
  const { purchasePremium, isPremium } = useBilling();
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [price, setPrice] = useState('Loading...');
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const devTapCount = useRef(0);
  const devTapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleEmailRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail) return;

    setIsRestoring(true);
    try {
      const response = await fetch('/api/restore-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoreToken: restoreEmail }),
      });
      const data = await response.json();

      if (data.success) {
        await Preferences.set({ key: 'isPremium', value: 'true' });
        sessionStorage.setItem('isPremium', 'true');
        window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
        toast.success("Premium restored successfully!");
        setIsRestoreOpen(false);
      } else {
        toast.error("No active premium purchase found for this email.");
      }
    } catch (error) {
      toast.error("Failed to restore purchase. Please try again.");
    } finally {
      setIsRestoring(false);
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

      <div className="w-full space-y-1">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 py-1.5 px-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left shadow-sm"
          >
            <benefit.icon className="h-6 w-6 text-red-600 shrink-0" />
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {benefit.title}
                {benefit.note && <> <span className="whitespace-nowrap">{benefit.note}</span></>}
              </h3>
            </div>
            <Check className="h-3.5 w-3.5 text-green-500" />
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

      <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
        <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Restore Purchase</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEmailRestore}>
            <div className="flex flex-col gap-1.5 py-1 px-1">
              <Label htmlFor="restore-email" className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider">
                Email Used At Checkout
              </Label>
              <Input
                id="restore-email"
                type="email"
                placeholder="your@email.com"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                disabled={isRestoring}
                required
                autoFocus
                className="w-full h-11 rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4 disabled:opacity-50"
              />
            </div>

            <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRestoreOpen(false)}
                disabled={isRestoring}
                className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRestoring}
                variant="primary"
                className="flex-1 h-11 rounded-xl shadow-sm transition-all active:scale-95 font-medium disabled:opacity-50"
              >
                {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Restore"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumOfferStep;
