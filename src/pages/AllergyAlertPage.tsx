"use client";

import React from 'react';
import { useParams } from 'react-router-dom';
import AllergyCard from '@/components/AllergyCard';
import { LanguageCode } from '@/lib/types';
import NotFound from './NotFound';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();

  // Get selected allergens from local storage
  const [selectedAllergens, setSelectedAllergens] = React.useState<string[]>([]);
  React.useEffect(() => {
    const stored = localStorage.getItem('selectedAllergens');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const standard = parsed.standard || [];
        const custom = parsed.custom || [];
        setSelectedAllergens([...standard, ...custom]);
      } catch (e) {
        console.error('Failed to parse stored allergens', e);
        localStorage.removeItem('selectedAllergens');
      }
    }
  }, []);

  // Validate language code
  React.useEffect(() => {
    const validCodes = Object.keys(require('@/lib/translations').translations || {});
    if (!validCodes.includes(langCode || '')) {
      // Navigate to not found if invalid
      window.location.href = '/';
    }
  }, [langCode]);

  if (!langCode) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-white">
      <AllergyCard 
        languageCode={langCode as LanguageCode} 
        selectedAllergens={selectedAllergens} 
      />
    </div>
  );
};

export default AllergyAlertPage;