"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2, RefreshCw } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

const PremiumUnlock = () => {
  const { isPremium, isLoading, purchasePremium, restorePurchases } = useBilling();

  if (isLoading) return null;

  if (isPremium) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3">
        <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800 dark:text-green-200">Premium Unlocked</p>
          <p className="text-xs text-green-600 dark:text-green-400">Thank you for supporting us!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full">
          <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Upgrade to Premium</h3>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          onClick={purchasePremium}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-6 text-lg font-bold shadow-md transition-transform active:scale-95"
        >
          Unlock Now
        </Button>
        
        <button 
          onClick={restorePurchases}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 py-1"
        >
          <RefreshCw className="h-3 w-3" />
          Restore Purchases
        </button>
      </div>
    </div>
  );
};

export default PremiumUnlock;