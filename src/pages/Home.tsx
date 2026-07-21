"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import ProtectCardsDialog from '@/components/ProtectCardsDialog';
import BackupRestoreDialog from '@/components/BackupRestoreDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { useBilling } from '@/hooks/useBilling';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [hasCards, setHasCards] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);

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

  const showDescription = !hasCards;

  return (
    <div className="relative flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-6 pt-[calc(100px+env(safe-area-inset-top))] min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-4 gap-8 md:gap-12">

          <div className="w-full space-y-4 mt-4 flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Travel Safely. <br />
              <span className="text-red-600">Eat with Confidence.</span>
            </h1>

            {showDescription && <div className="h-4" />}

          </div>

          <motion.div
            layout
            className="w-full flex items-center justify-center flex-1 min-h-0 max-h-[225px] md:max-h-[300px] overflow-hidden"
          >
            <img
              src="/images/logo_main.png"
              alt="App Logo"
              className="max-h-full w-auto object-contain max-w-[275px] md:max-w-[350px]"
            />
          </motion.div>

          <AnimatePresence>
            {hasCards && (
              <motion.div
                key="cards-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex-shrink-0 mt-auto flex flex-col items-center"
              >
                <SavedCardsList />
                <button
                  onClick={handleGetStarted}
                  className="mt-3 text-[14px] font-bold text-red-600 uppercase tracking-widest hover:underline"
                >
                  + Add Card
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center gap-2 mt-auto mb-[calc(12px+env(safe-area-inset-bottom))]">
          {!hasCards && (
            <>
              <Button
                onClick={handleGetStarted}
                variant="primary"
                className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
              >
                Get Started
              </Button>

              <button
                onClick={() => setShowBackupDialog(true)}
                className="text-[11px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-wider"
              >
                Restore from backup
              </button>
            </>
          )}

          <p className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
            {/*
            <span>v1.1.3.5{isPremium ? 'u' : ''}</span>
            <span>·</span>
            */}
            <span>© 2026 <a href="https://simpleallergyalert.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Simple Allergy Alert</a></span>
          </p>
        </div>
      </div>

      <BackupRestoreDialog isOpen={showBackupDialog} onClose={() => setShowBackupDialog(false)} />
      <ProtectCardsDialog visible={hasCards} />
    </div>
  );
};

export default Home;