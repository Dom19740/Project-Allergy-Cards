"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Check, ChevronRight, Globe, ShieldAlert, MessageSquare, Save, Smartphone } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import FixedHeader from '@/components/FixedHeader';

const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const { purchasePremium, isPremium, price } = useBilling();

  const benefits = [
    {
      icon: Globe,
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
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-6 pt-[calc(80px+env(safe-area-inset-top)+20px)] pb-8">
        <div className="flex-grow flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Unlock Premium
              </h2>
              <div className="relative">
                <div className="absolute -inset-2 bg-amber-400 rounded-full blur-md opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-2xl shadow-xl shadow-amber-500/20 transform rotate-12">
                  <Crown className="h-8 w-8 text-white fill-white/20" />
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Unlock the full power of Simple Allergy Alert and travel with total peace of mind.
            </p>
          </div>

          <div className="w-full space-y-3 py-2">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left transition-transform hover:scale-[1.02]"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl shrink-0">
                  <benefit.icon className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900 dark:text-white">{benefit.title}</h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-8">
          {!isPremium && (
            <Button 
              onClick={purchasePremium}
              className="w-full py-8 text-xl font-black bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xl shadow-amber-600/20 transition-all active:scale-95 flex flex-col items-center justify-center border-b-4 border-amber-800"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6" />
                <span>Unlock Everything</span>
              </div>
              <span className="text-xs font-medium opacity-80 mt-1 uppercase tracking-widest">One-time payment of {price}</span>
            </Button>
          )}
          
          <Button 
            variant="ghost"
            onClick={handleContinue}
            className="w-full py-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 font-semibold"
          >
            {isPremium ? "Continue to App" : "Maybe Later"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboarding;