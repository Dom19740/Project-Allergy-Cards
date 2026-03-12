"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

const Home = () => {
  const [hasCards, setHasCards] = useState(false);

  const checkCards = async () => {
    const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    setHasCards(!!((cards && cards.length > 0) || emergencyCard));
  };

  useEffect(() => {
    checkCards();
    
    const handleStorageChange = () => checkCards();
    
    // Listen for standard storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom storage update events (same-tab)
    window.addEventListener('storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(106px+env(safe-area-inset-top)+10px)] pb-[env(safe-area-inset-bottom)] min-h-0">
        <div className="flex-1 flex flex-col items-center text-center min-h-0">
          <div className={cn("w-full flex items-center justify-center min-h-0 p-2 transition-all duration-500 ease-in-out", hasCards ? "flex-[0.3]" : "flex-[0.5]")}>
            <img src="/logo_main.png" alt="App Logo" className={cn("max-h-full w-auto h-auto object-contain transition-all duration-500", hasCards ? "max-w-[160px]" : "max-w-[220px] md:max-w-[280px]")} />
          </div>
          <div className={cn("flex flex-col w-full py-2 min-h-0 transition-all duration-500", hasCards ? "flex-1 justify-around" : "flex-[0.5] justify-center")}>
            <div className={cn("space-y-3 transition-all duration-500", !hasCards && "mb-8")}>
              <p className={cn("text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-relaxed transition-all duration-500", hasCards ? "text-sm md:text-base" : "text-base md:text-xl")}>
                Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely.
              </p>
              <p className={cn("text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-relaxed transition-all duration-500", hasCards ? "text-sm md:text-base" : "text-base md:text-lg")}>
                 Plus a translated emergency alert card.
              </p>
            </div>
            {hasCards && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SavedCardsList />
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-4 gap-3">
          <Button asChild className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]">
            <Link to="/onboarding">Get Started</Link>
          </Button>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
            © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;