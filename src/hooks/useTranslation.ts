"use client";

import { useState, useEffect } from 'react';
import { SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { translateCardContent } from '@/lib/translator';

export const useTranslation = (
  languageCode: string,
  selectedAllergens: SelectedAllergens,
  customMessages: CustomMessages
) => {
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const translate = async () => {
      if (!languageCode) return;
      
      setIsLoading(true);
      try {
        const content = await translateCardContent(languageCode, selectedAllergens, customMessages);
        setTranslatedContent(content);
        setError(null);
      } catch (err) {
        console.error("Translation error:", err);
        setError(err instanceof Error ? err : new Error('Failed to translate'));
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [languageCode, JSON.stringify(selectedAllergens), JSON.stringify(customMessages)]);

  return { translatedContent, isLoading, error };
};