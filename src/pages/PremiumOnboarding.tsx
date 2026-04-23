"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Check, Crown, X } from "lucide-react";

const PremiumOnboarding = () => {
  const navigate = useNavigate();

  const benefits = [
    "Unlock Home Screen Widget",
    "Unlimited Saved Cards",
    "Voice Read-Aloud Feature",
    "Priority Language Updates",
    "No Watermarks on Cards"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <div className="p-4 flex justify-end">
        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-gray-100 dark:bg-zinc-900">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow px-6 flex flex-col items-center text-center">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-3xl mb-6">
          <Crown className="w-12 h-12 text-amber-600 dark:text-amber-400" />
        </div>
        
        <h1 className="text-3xl font-black mb-2">Go Premium</h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-8">Unlock the full power of Simple Allergy Alert</p>

        <div className="w-full max-w-sm space-y-3 mb-10">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Button className="w-full py-7 rounded-2xl text-lg font-bold bg-zinc-900 dark:bg-white dark:text-zinc-900">
            Upgrade Now — $4.99
          </Button>
          
          <button 
            onClick={() => navigate('/promo')}
            className="text-sm font-bold text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest"
          >
            Have a promo code?
          </button>
        </div>
      </div>

      <div className="p-8 text-center">
        <p className="text-xs text-gray-400">One-time purchase. Lifetime access.</p>
      </div>
    </div>
  );
};

export default PremiumOnboarding;