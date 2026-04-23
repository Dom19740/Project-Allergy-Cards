"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

const PremiumUnlock = () => {
  const navigate = useNavigate();
  const { isPremium, isLoading } = useBilling();

  if (isLoading) return null;

  if (isPremium) {
    return (
      <div className="w-[280px] mx-auto p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center justify-center gap-3">
        <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-full">
          <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-100">Premium Unlocked</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">Thank you for supporting us!</p>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => navigate('/unlock-premium')}
      className="w-[280px] mx-auto p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-transform active:scale-95"
    >
      <div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-full">
        <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-amber-900 dark:text-amber-100">Unlock Premium</p>
        <p className="text-[10px] text-amber-700 dark:text-amber-400">Get all features & languages</p>
      </div>
    </button>
  );
};

export default PremiumUnlock;