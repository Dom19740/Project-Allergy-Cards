"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AllergyCard from '../components/AllergyCard';
import { LanguageCode } from '@/lib/types';
import NotFound from './NotFound';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllergens = async () => {
      const storedData = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      let allergens: string[] = [];

      if (storedData) {
        // Combine standard and custom allergens into a single array for the AllergyCard
        if (storedData.standard && Array.isArray(storedData.standard)) {
          allergens = [...allergens, ...storedData.standard];
        }
        if (storedData.custom) {
          if (Array.isArray(storedData.custom)) {
            allergens = [...allergens, ...storedData.custom];
          } else if (typeof storedData.custom === 'object') {
            // Fallback for translation object format
            allergens = [...allergens, ...Object.keys(storedData.custom)];
          }
        }
        
        // Fallback for old array format
        if (Array.isArray(storedData) && allergens.length === 0) {
          allergens = storedData;
        }
      }
      setSelectedAllergens(allergens);
      setIsLoading(false);
    };
    loadAllergens();
  }, []);

  if (!langCode) {
    return <NotFound />;
  }

  if (isLoading) {
    return null; // Or a loader
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-white">
      <AllergyCard 
        languageCode={langCode as LanguageCode} 
        selectedAllergens={selectedAllergens} 
      />
    </div>
  );
};

export default AllergyAlertPage;