"use client";

import React from 'react';
import { useParams } from 'react-router-dom';
import AllergyCard from '../components/AllergyCard';
import { LanguageCode } from '@/lib/types';
import NotFound from './NotFound';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();

  if (!langCode) {
    return <NotFound />;
  }

  // Retrieve selected allergens from local storage
  const storedData = localStorage.getItem('selectedAllergens');
  let selectedAllergens: string[] = [];

  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      // Combine standard and custom allergens into a single array for the AllergyCard
      if (parsed.standard && Array.isArray(parsed.standard)) {
        selectedAllergens = [...selectedAllergens, ...parsed.standard];
      }
      if (parsed.custom) {
        if (Array.isArray(parsed.custom)) {
          selectedAllergens = [...selectedAllergens, ...parsed.custom];
        } else if (typeof parsed.custom === 'object') {
          // Fallback for translation object format
          selectedAllergens = [...selectedAllergens, ...Object.keys(parsed.custom)];
        }
      }
      
      // Fallback for old array format
      if (Array.isArray(parsed) && selectedAllergens.length === 0) {
        selectedAllergens = parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored allergens", e);
    }
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