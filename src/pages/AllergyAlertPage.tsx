"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import AllergyCard from '../components/AllergyCard';
import { LanguageCode } from '@/lib/types';
import NotFound from './NotFound';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const location = useLocation();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllergens = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };
    loadAllergens();
  }, [langCode, location.key]); // Reload when language or route changes

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
      />
    </div>
  );
};

export default AllergyAlertPage;