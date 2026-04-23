"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Check, ChevronRight, Globe, ShieldAlert, MessageSquare, Save, Smartphone } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import FixedHeader from '@/components/FixedHeader';

const PremiumOnboarding = () => {
  const navigate = useNavigate();
  const { purchasePremium, isPremium } = useBilling();

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
        <div className="flex-grow flex flex-col items-center text-center space-y-6">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
            <Crown className="h-12 w-12 text-amber-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock Premium</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock the full power of Simple Allergy Alert and travel with total peace of mind.
            </p>
          </div>

          <div className="w-full space-y-3 py-2">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl shrink-0">
                  <benefit.icon className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                </div>
                <Check className="h-5 w-5 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-6">
          {!isPremium && (
            <Button 
              onClick={purchasePremium}
              className="w-full py-7 text-xl font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6" />
                <span>Unlock Everything</span>
              </div>
              <span className="text-xs font-normal opacity-90 mt-1">One-time payment of $4.99</span>
            </Button>
          )}
          
          <Button 
            variant="ghost"
            onClick={handleContinue}
            className="w-full py-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
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