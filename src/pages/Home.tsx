"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import PremiumUnlock from '@/components/PremiumUnlock';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { useBilling } from '@/hooks/useBilling';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';

const layoutTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
  mass: 1
};

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
    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({ name: 'get_started_click' });
    }

    const hasSeenOnboarding = await storage.get<any>(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    if (hasSeenOnboarding === 'true' || hasSeenOnboarding === true) {
      navigate('/select-allergens');
    } else {
      navigate('/onboarding');
    }
  };

  const showDescription = !(hasCards && isPremium);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-6 pt-[calc(80px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-2">
          
          <motion.div 
            layout 
            transition={layoutTransition}
            className="w-full space-y-2 md:space-y-4 mt-2 flex-shrink-0"
          >
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Travel Safely. <br />
              <span className="text-red-600">Eat with Confidence.</span>
            </h1>
            
            <AnimatePresence mode="popLayout">
              {showDescription && (
                <motion.div 
                  key="description"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed space-y-1 md:space-y-3"
                >
                  <p>
                    Create personalized allergy alerts in over 100 languages to communicate your dietary restrictions easily and safely.
                  </p>
                  <p className="hidden xs:block">
                    Save a translated emergency card to communicate your need for medical attention. 
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            layout
            transition={layoutTransition}
            className="w-full flex items-center justify-center flex-1 min-h-0 overflow-hidden my-4"
          >
            <img 
              src="/images/logo_main.png" 
              alt="App Logo" 
              className="max-h-full w-auto h-auto object-contain drop-shadow-xl max-w-[250px] md:max-w-[350px] aspect-square" 
            />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {hasCards && isPremium && (
              <motion.div 
                key="cards-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="w-full flex-shrink-0 min-h-0 overflow-hidden"
              >
                <SavedCardsList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-4 gap-3 mt-auto">
          {isPremium && (
            <motion.div layout transition={layoutTransition} className="w-full px-4">
              <PremiumUnlock />
            </motion.div>
          )}
          
          <motion.div layout transition={layoutTransition} className="w-full flex justify-center">
            <Button 
              onClick={handleGetStarted}
              className="py-3 md:py-4 text-lg md:text-2xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-full max-w-[300px] shadow-xl rounded-2xl font-bold"
            >
              Get Started
            </Button>
          </motion.div>

          <motion.div layout transition={layoutTransition} className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
              © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">dpb creative</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;