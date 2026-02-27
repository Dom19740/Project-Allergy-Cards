"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AllergyCard from '@/components/AllergyCard';
import { LanguageCode } from '@/lib/types';
import { getSupportedLanguages } from '@/lib/translator';
import NotFound from './NotFound';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isValidLanguage, setIsValidLanguage] = useState<boolean | null>(null);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const langs = await getSupportedLanguages();
        if (!mounted) return;
        const found = !!langCode && langs.some(lang => lang.code === langCode);
        setIsValidLanguage(found);
      } catch (e) {
        console.error('Failed to load supported languages', e);
        setIsValidLanguage(false);
      } finally {
        if (mounted) setLoadingLanguages(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [langCode]);

  // Load selected allergens from local storage on mount
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        const standard = parsed.standard || [];
        // Only include the allergens that were selected (standard includes selected custom items)
        setSelectedAllergens(standard);
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
        localStorage.removeItem('selectedAllergens');
      }
    }
  }, []);

  if (!langCode) {
    return <NotFound />;
  }

  if (loadingLanguages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (!isValidLanguage) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-white">
      <AllergyCard languageCode={langCode as LanguageCode} selectedAllergens={selectedAllergens} />
    </div>
  );
};

export default AllergyAlertPage;