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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-md mx-auto px-6 pt-[calc(80px+env(safe-area-inset-top)+20px)] pb-8">
        <div className="flex-grow flex flex-col items-center text-center space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Unlock Premium
              </h2>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-lg">
                <Crown className="h-5 w-5 text-amber-600 fill-amber-600/20" />
              </div>
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Get the full power of Simple Allergy Alert and travel with total peace of mind.
            </p>
          </div>

          <div className="w-full space-y-2.5">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3.5 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left shadow-sm"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg shrink-0">
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

        <div className="w-full flex flex-col gap-3 mt-10">
          {!isPremium && (
            <Button 
              onClick={purchasePremium}
              className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex flex-col items-center justify-center"
            >
              <span>Unlock Everything</span>
              <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">One-time payment of {price}</span>
            </Button>
          )}
          
          <Button 
            variant="ghost"
            onClick={handleContinue}
            className="w-full h-12 text-gray-400 hover:text-gray-600 dark:text-gray-500 font-medium text-sm"
          >
            {isPremium ? "Continue to App" : "Maybe Later"}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboarding;