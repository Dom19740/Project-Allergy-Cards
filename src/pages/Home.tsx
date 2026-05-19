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
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';

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

  const triggerTestCrash = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseCrashlytics.crash({ message: 'Test crash from React' });
      } catch (error) {
        console.error('Failed to trigger crash:', error);
      }
    } else {
      alert('Crash only works on native platforms');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-6 pt-[calc(100px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] min-h-0">
        <div className="flex-1 flex flex-col items-center justify-between text-center min-h-0 py-4">
          
          {/* Top Section: Headline and Description */}
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Travel Safely. <br />
              <span className="text-red-600">Eat with Confidence.</span>
            </h1>
            
            {!(hasCards && isPremium) && (
              <div className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed space-y-3">
                <p>
                  Create personalized allergy alerts in over 100 languages to communicate your dietary restrictions easily and safely.
                </p>
                <p className="font-medium text-gray-500 dark:text-gray-500">
                  Save a translated emergency card to communicate your need for medical attention. 
                </p>
              </div>
            )}
          </div>

          {/* Middle Section: Logo */}
          <div className={cn(
            "w-full flex items-center justify-center transition-all duration-700 ease-in-out my-6",
            hasCards && isPremium ? "flex-[0.4]" : "flex-[0.6]"
          )}>
            <img 
              src="/images/logo_main.png" 
              alt="App Logo" 
              className={cn(
                "max-h-full w-auto h-auto object-contain drop-shadow-xl", 
                hasCards && isPremium ? "max-w-[140px] md:max-w-[180px]" : "max-w-[220px] md:max-w-[280px]"
              )} 
            />
          </div>

          {/* Bottom Section: Saved Cards (if any) */}
          {hasCards && isPremium && (
            <div className="w-full flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SavedCardsList />
            </div>
          )}
        </div>

        {/* Footer Action Area */}
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-6 gap-4 mt-auto">
          <Button 
            onClick={handleGetStarted}
            className="py-4 text-xl md:text-2xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-full max-w-[300px] shadow-xl rounded-2xl font-bold"
          >
            Get Started
          </Button>

          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
              © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">dpb creative</a>
            </p>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={triggerTestCrash}
                className="text-[8px] text-gray-300 dark:text-gray-700 hover:text-red-500 transition-colors mt-1"
              >
                Debug: Test Crash
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;