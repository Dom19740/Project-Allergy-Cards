"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

const Home = () => {
  const navigate = useNavigate();
  const [hasCards, setHasCards] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  const checkCards = async () => {
    const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    setHasCards(!!((cards && cards.length > 0) || emergencyCard));
  };

  useEffect(() => {
    const init = async () => {
      // Check if user needs onboarding
      const hasSeenOnboarding = await storage.get<string>(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      if (hasSeenOnboarding !== 'true') {
        navigate('/onboarding', { replace: true });
        return;
      }
      
      setIsCheckingOnboarding(false);
      checkCards();
    };

    init();
    
    const handleStorageChange = () => checkCards();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, [navigate]);

  const handleGetStarted = async () => {
    navigate('/select-allergens');
  };

  if (isCheckingOnboarding) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse text-red-600 font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-2">
          {/* Logo Area */}
          <div className={cn(
            "w-full flex items-center justify-center min-h-0 p-1 transition-all duration-500 ease-in-out", 
            hasCards ? "flex-[0.4]" : "flex-[0.5]"
          )}>
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className={cn(
                "max-h-full w-auto h-auto object-contain transition-all duration-500", 
                hasCards ? "max-w-[220px] md:max-w-[280px]" : "max-w-[260px] md:max-w-[340px]"
              )} 
            />
          </div>

          {/* Text and Cards Area */}
          <div className={cn(
            "flex flex-col w-full py-1 min-h-0 transition-all duration-500", 
            hasCards ? "flex-[0.6] justify-center" : "flex-[0.5] justify-center"
          )}>
            <div className="space-y-3 mb-2">
              <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-tight text-lg md:text-xl">
                Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely.
              </p>
              <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-tight text-lg md:text-xl">
                 Save a translated emergency alert card to communicate your need for medical attention.
              </p>
            </div>
            
            {hasCards && (
              <div className="w-full mt-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SavedCardsList />
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Area */}
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-2 gap-2 mt-auto">
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