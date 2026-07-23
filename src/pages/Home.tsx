"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';
import ProtectCardsDialog from '@/components/ProtectCardsDialog';
import BackupRestoreDialog from '@/components/BackupRestoreDialog';
import HomeMenu from '@/components/HomeMenu';
import PromoCodeDialog from '@/components/PromoCodeDialog';
import RestorePurchaseDialog from '@/components/RestorePurchaseDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { useBilling } from '@/hooks/useBilling';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageSEO } from '@/hooks/usePageSEO';

const Home = () => {
  const navigate = useNavigate();
  const { isPremium, restorePurchases } = useBilling();
  const [hasCards, setHasCards] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPromoCodeDialog, setShowPromoCodeDialog] = useState(false);
  const [showRestorePurchaseDialog, setShowRestorePurchaseDialog] = useState(false);

  usePageSEO({
    title: 'Allergy Card App | Simple Allergy Alert',
    description: "Simple Allergy Alert is a free allergy card app - create translated allergy alert cards in 100+ languages to show restaurants, hotels and hosts exactly what you can't eat, anywhere in the world.",
    noindex: false
  });

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

  // Always shows onboarding, on every click - not just the first time. Users
  // who already have a saved card use handleAddCard below instead, which
  // skips straight to card creation without onboarding in the way.
  const handleGetStarted = () => {
    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({ name: 'get_started_click' });
    }
    navigate('/onboarding');
  };

  const handleAddCard = () => {
    navigate('/select-allergens');
  };

  const handleRestorePurchaseClick = () => {
    if (Capacitor.getPlatform() === 'web') {
      setShowRestorePurchaseDialog(true);
    } else {
      restorePurchases();
    }
  };

  const showDescription = !hasCards;

  return (
    <div className="relative flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-6 pt-[calc(100px+env(safe-area-inset-top))] min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-4 gap-8 md:gap-12"
        >

          <div className="w-full space-y-4 mt-4 flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Travel Safely. <br />
              <span className="text-red-600">Eat with Confidence.</span>
            </h1>

            <motion.p
              initial={false}
              animate={{ height: showDescription ? 'auto' : 0, opacity: showDescription ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden text-base text-gray-600 dark:text-gray-400"
            >
              Create allergy cards in 100+ languages and communicate food allergies instantly.
            </motion.p>

          </div>

          <motion.div
            layout
            className="w-full flex items-center justify-center flex-1 min-h-0 max-h-[225px] md:max-h-[300px] overflow-hidden"
          >
            <img
              src="/images/logo_main.png"
              alt="Simple Allergy Alert - allergy card app logo"
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
                  onClick={handleAddCard}
                  className="mt-3 text-[14px] font-bold text-red-600 uppercase tracking-widest hover:underline"
                >
                  + Add Card
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center gap-2 mt-auto mb-[calc(12px+env(safe-area-inset-bottom))]">
          <motion.div
            initial={false}
            animate={{ height: hasCards ? 0 : "auto", opacity: hasCards ? 0 : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="relative w-full flex items-center justify-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Menu"
                className="absolute left-0 flex items-center justify-center h-10 w-10 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Button
                onClick={handleGetStarted}
                variant="primary"
                className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
              >
                Get Started
              </Button>
            </div>
          </motion.div>

          <p className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
            {/*
            <span>v1.1.3.5{isPremium ? 'u' : ''}</span>
            <span>·</span>
            */}
            <span>© 2026 <a href="https://simpleallergyalert.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">Simple Allergy Alert</a></span>
          </p>
        </div>
      </div>

      <HomeMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isPremium={isPremium}
        onOpenPromoCode={() => setShowPromoCodeDialog(true)}
        onOpenRestorePurchase={handleRestorePurchaseClick}
        onOpenBackupRestore={() => setShowBackupDialog(true)}
      />
      <PromoCodeDialog
        isOpen={showPromoCodeDialog}
        onClose={() => setShowPromoCodeDialog(false)}
        onSuccess={() => {
          // Success logic is handled inside the dialog
        }}
      />
      <RestorePurchaseDialog isOpen={showRestorePurchaseDialog} onClose={() => setShowRestorePurchaseDialog(false)} />
      <BackupRestoreDialog isOpen={showBackupDialog} onClose={() => setShowBackupDialog(false)} />
      <ProtectCardsDialog visible={hasCards} />
    </div>
  );
};

export default Home;