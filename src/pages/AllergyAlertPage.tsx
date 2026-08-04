"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import AllergyCard from '../components/AllergyCard';
import { CustomMessages, LanguageCode, TranslatedContent } from '@/lib/types';
import NotFound from './NotFound';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { resolveCustomMessages, computeContentSignature } from '@/lib/customMessages';
import { usePageSEO } from '@/hooks/usePageSEO';

const AllergyAlertPage = () => {
  usePageSEO({ title: 'Your Allergy Card | Simple Allergy Alert' });

  const { langCode } = useParams<{ langCode: string }>();
  const location = useLocation();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [initialTranslations, setInitialTranslations] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Swiping/tapping between cards re-runs this effect (langCode or
  // location.key changes) just like the very first visit does. Without this,
  // every card switch would replace the whole page with the loading screen
  // below - even though the data is already cached - which is what made
  // swipe transitions feel like a hard interrupt instead of a continuation.
  // Only the true first load should show that screen; later loads just keep
  // rendering the current card until the fresh data is ready.
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedOnceRef.current) setIsLoading(true);

      // Load allergens
      const storedData = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      let allergens: string[] = [];

      if (storedData) {
        if (Array.isArray(storedData.ids)) {
          // ids is the canonical, order-preserving list - every writer of
          // this key includes it. Re-deriving from standard+custom instead
          // (the old fallback below) can produce a different order, which
          // showed up as allergen pills/images visibly reshuffling right
          // after a card switch, once this page's own reload caught up.
          allergens = [...storedData.ids];
        } else if (storedData.standard || storedData.custom) {
          if (storedData.standard && Array.isArray(storedData.standard)) {
            allergens = [...allergens, ...storedData.standard];
          }
          if (storedData.custom) {
            if (Array.isArray(storedData.custom)) {
              allergens = [...allergens, ...storedData.custom];
            } else if (typeof storedData.custom === 'object') {
              allergens = [...allergens, ...Object.keys(storedData.custom)];
            }
          }
        } else if (Array.isArray(storedData)) {
          allergens = storedData;
        }
      }
      setSelectedAllergens(allergens);

      // Load translations for offline support - only trust the cache if it
      // matches the current custom messages and allergen selection, since a
      // cached translation from before an edit is no longer valid.
      const savedMessages = await storage.get<Partial<CustomMessages>>(STORAGE_KEYS.CUSTOM_MESSAGES);
      const customMessages = resolveCustomMessages(savedMessages);
      const contentSignature = computeContentSignature(customMessages, allergens);

      const sessionTranslations = await storage.get<any>(STORAGE_KEYS.SESSION_TRANSLATIONS);
      if (
        sessionTranslations &&
        sessionTranslations.languageCode === langCode &&
        sessionTranslations.signature === contentSignature
      ) {
        setInitialTranslations(sessionTranslations.content);
      } else {
        setInitialTranslations(null);
      }

      hasLoadedOnceRef.current = true;
      setIsLoading(false);
    };
    loadData();
  }, [langCode, location.key]);

  if (!langCode) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-white">
      <AllergyCard 
        languageCode={langCode as LanguageCode} 
        selectedAllergens={selectedAllergens}
        initialTranslations={initialTranslations}
      />
    </div>
  );
};

export default AllergyAlertPage;