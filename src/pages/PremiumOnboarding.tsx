"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, Globe, Save } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const { isPremium, purchasePremium, restorePurchases } = useBilling();

  const handleContinue = () => {
    navigate('/select-allergens');
  };

  const features = [
    {
      icon: <Save className="h-5 w-5 text-amber-600" />,
      title: "Unlimited Saved Cards",
      description: "Save as many allergy cards as you need for different situations."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
      title: "Emergency Medical Cards",
      description: "Access specialized cards for urgent medical situations."
    },
    {
      icon: <Globe className="h-5 w-5 text-amber-600" />,
      title: "Offline Access",
      description: "Your saved cards are available even without an internet connection."
    },
    {
      icon: <Crown className="h-5 w-5 text-amber-600" />,
      title: "Support Development",
      description: "Help us keep the app updated and free of advertisements."
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="bg-amber-100 dark:bg-amber-900/40 p-4 rounded-full mb-6 animate-bounce">
          <Crown className="h-12 w-12 text-amber-600 dark:text-amber-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Go Premium
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          Unlock the full potential of your safety companion.
        </p>

        <div className="w-full space-y-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full space-y-4">
          {!isPremium ? (
            <>
              <Button 
                onClick={purchasePremium}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-7 text-xl font-bold shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Crown className="h-6 w-6" />
                Unlock Premium
              </Button>
              
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={restorePurchases}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Restore Purchases
                </button>
                
                <button 
                  onClick={handleContinue}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  Maybe later
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="h-5 w-5" />
                Premium Unlocked!
              </div>
              <Button 
                onClick={handleContinue}
                className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl py-7 text-xl font-bold"
              >
                Continue to App
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboarding;