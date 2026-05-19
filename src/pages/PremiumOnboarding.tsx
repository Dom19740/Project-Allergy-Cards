"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Check, ChevronRight, Languages, ShieldAlert, MessageSquare, Save, Smartphone } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import FixedHeader from '@/components/FixedHeader';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import { getPremiumPrice } from '@/lib/billing';

const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const { purchasePremium, isPremium } = useBilling();
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [price, setPrice] = useState('Loading...');

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
      
      <div className="flex flex-col flex-grow w-full max-w-md mx-auto px-6 pt-[calc(80px+env(safe-area-inset-top)+20px)] pb-8">
        <div className="flex-grow flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isPremium ? "Premium Unlocked" : "Unlock Premium"}
              </h2>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg">
                <Crown className="h-5 w-5 text-amber-600 fill-amber-600/20" />
              </div>
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              {isPremium 
                ? "You have full access to all features. Travel with total peace of mind."
                : "Get the full power of Simple Allergy Alert and travel with total peace of mind."}
            </p>
          </div>

          <div className="w-full space-y-1.5">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3.5 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left shadow-sm"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg shrink-0">
                  <benefit.icon className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{benefit.title}</h3>
                </div>
                <Check className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-8">
          {!isPremium && (
            <Button 
              onClick={purchasePremium}
              className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {price === 'Loading...' ? 'Loading Price...' : `One-time payment of ${price}`}
            </Button>
          )}
          
          <button 
            onClick={() => setIsPromoOpen(true)}
            className="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-widest transition-colors py-1"
          >
            Redeem Promo Code
          </button>
          
          <Button 
            onClick={handleContinue}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
          >
            {isPremium ? "Continue to App" : "Maybe Later"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <PromoCodeDialog 
        isOpen={isPromoOpen} 
        onClose={() => setIsPromoOpen(false)}
        onSuccess={() => {
          // Success logic is handled inside the dialog
        }}
      />
    </div>
  );
};

export default PremiumOnboarding;