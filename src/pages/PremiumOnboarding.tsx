"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Check, ChevronRight, Languages, ShieldAlert, MessageSquare, Save, Smartphone, Loader2, Receipt } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import FixedHeader from '@/components/FixedHeader';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import { getPremiumPrice } from '@/lib/billing';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const { purchasePremium, isPremium } = useBilling();
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [price, setPrice] = useState('Loading...');
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Manual Verification states
  const [manualOrderId, setManualOrderId] = useState('');
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const handleEmailRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail) return;
    
    setIsRestoring(true);
    try {
      const response = await fetch(`/api/restore-by-email?email=${encodeURIComponent(restoreEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('isPremium', 'true');
        await Preferences.set({ key: 'isPremium', value: 'true' });
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

  const handleVerifyManualOrder = async () => {
    const trimmedId = manualOrderId.trim();
    if (!trimmedId) {
      toast.error("Please enter a valid Order ID.");
      return;
    }

    setIsVerifyingManual(true);
    try {
      const response = await fetch(`/api/verify-order?order_id=${trimmedId}`);
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('isPremium', 'true');
        await Preferences.set({ key: 'isPremium', value: 'true' });
        window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
        toast.success("Premium successfully verified and unlocked!", {
          icon: '🎉',
        });
        setManualOrderId('');
      } else {
        toast.error(`Order is not paid. Status: ${data.status || 'unknown'}`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify Order ID. Please check the ID and try again.");
    } finally {
      setIsVerifyingManual(false);
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

  const benefits = [
    {
      icon: Languages,
      title: "100+ Languages",
    },
    {
      icon: ShieldAlert,
      title: "Custom Allergens",
    },
    {
      icon: MessageSquare,
      title: "Custom Alerts",
    },
    {
      icon: Save,
      title: "Save Multiple Cards",
    },
    {
      icon: Smartphone,
      title: "Home Screen Widget",
    }
  ];

  const handleContinue = () => {
    navigate('/select-allergens');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-md mx-auto px-6 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <div className="flex-grow flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isPremium ? "Premium Unlocked" : "Unlock Premium"}
              </h2>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-lg">
                <Crown className="h-4 w-4 text-amber-600 fill-amber-600/20" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {isPremium 
                ? "You have full access to all features. Travel with total peace of mind."
                : "Get the full power of Simple Allergy Alert and travel with total peace of mind."}
            </p>
          </div>

          <div className="w-full space-y-1">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left shadow-sm"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg shrink-0">
                  <benefit.icon className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs">{benefit.title}</h3>
                </div>
                <Check className="h-3.5 w-3.5 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-auto mb-[50px]">
          {!isPremium && (
            <Button 
              onClick={purchasePremium}
              className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {Capacitor.getPlatform() === 'web' 
                ? 'One-time payment of $3.99' 
                : (price === 'Loading...' ? 'Loading Price...' : `One-time payment of ${price}`)}
            </Button>
          )}

          {/* Manual Order ID Verification bypass */}
          {!isPremium && (
            <div className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-left space-y-2 my-1">
              <div className="flex items-center gap-1 text-gray-500">
                <Receipt className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Already Paid?</span>
              </div>
              <p className="text-[10px] text-gray-400">
                If the redirect URL showed a 404 during your test checkout, copy your **Order ID** from the confirmation screen or email and verify it below:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Order ID (e.g. 4821035)"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                />
                <Button 
                  onClick={handleVerifyManualOrder}
                  disabled={isVerifyingManual}
                  className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold shrink-0"
                >
                  {isVerifyingManual ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>
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
            
            <Button
              onClick={handleContinue}
              className="w-full py-3 px-8 text-lg h-auto bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
            >
              {isPremium ? "Continue to App" : "Maybe Later"}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <PromoCodeDialog
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        onSuccess={() => {
          // Success logic is handled inside the dialog
        }}
      />

      {isRestoreOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Restore Purchase</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter the email address you used during checkout to restore your premium status.
            </p>
            <form onSubmit={handleEmailRestore} className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent text-sm text-gray-900 dark:text-white"
                required
                disabled={isRestoring}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRestoreOpen(false)}
                  className="flex-1"
                  disabled={isRestoring}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isRestoring}
                >
                  {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Restore"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumOnboarding;