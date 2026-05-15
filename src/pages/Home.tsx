"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useBilling } from '@/hooks/useBilling';

const Home = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [hasCards, setHasCards] = useState(false);

  const checkCards = async () => {
    const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    setHasCards(!!((cards && cards.length > 0) || emergencyCard));
  };

  useEffect(() => {
    checkCards();
    
    const handleStorageChange = () => checkCards();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, []);

  const handleGetStarted = async () => {
    const hasSeenOnboarding = await storage.get<any>(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    if (hasSeenOnboarding === 'true' || hasSeenOnboarding === true) {
      navigate('/select-allergens');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-2">
          {/* Logo and Text Area */}
          <div className={cn(
            "w-full flex flex-col items-center justify-center min-h-0 p-1 transition-all duration-500 ease-in-out", 
            hasCards && isPremium ? "flex-[0.4]" : "flex-[0.5]"
          )}>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Travel Safely. <span className="text-red-600">Eat with Confidence.</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">
              Create personalized allergy alert cards in over 100 languages to communicate your dietary restrictions easily and safely.

Save a translated emergency card alert card to communicate your need for medical attention.
            </p>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">


            Save a translated emergency card alert card to communicate your need for medical attention.
            </p>

            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className={cn(
                "max-h-full w-auto h-auto object-contain transition-all duration-500", 
                hasCards && isPremium ? "max-w-[150px] md:max-w-[200px]" : "max-w-[200px] md:max-w-[260px]"
              )} 
            />
          </div>

          {/* Cards Area */}
          <div className={cn(
            "flex flex-col w-full py-1 min-h-0 transition-all duration-500", 
            hasCards && isPremium ? "flex-[0.6] justify-start" : "flex-[0.5] justify-center"
          )}>
            <div className="w-full space-y-4">
              {hasCards && isPremium && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <SavedCardsList />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Area */}
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-2 gap-3 mt-auto">
          <Button 
            onClick={handleGetStarted}
            className="py-3 text-xl md:text-2xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px] shadow-lg"
          >
            Get Started
          </Button>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
            © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;