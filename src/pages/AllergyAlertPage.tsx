"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import AllergyCard from '../components/AllergyCard';
import { CustomMessages, LanguageCode, TranslatedContent } from '@/lib/types';
import NotFound from './NotFound';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { resolveCustomMessages, computeContentSignature } from '@/lib/customMessages';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const location = useLocation();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [initialTranslations, setInitialTranslations] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load allergens
      const storedData = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      let allergens: string[] = [];

      if (storedData) {
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
        
        if (Array.isArray(storedData) && allergens.length === 0) {
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