"use client";

import { useState, useEffect } from 'react';
import { SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

export const useTranslation = (
  languageCode: string, 
  selectedAllergens: SelectedAllergens, 
  customMessages: CustomMessages
) => {
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translate = async () => {
      setIsLoading(true);
      // Mock translation logic
      const selectedIds = Object.keys(selectedAllergens).filter(id => selectedAllergens[id]);
      const allergenNames = ALLERGEN_OPTIONS
        .filter(a => selectedIds.includes(a.id))
        .map(a => a.name);

      setTranslatedContent({
        title: "ALLERGY ALERT",
        alerts: ["I have a severe food allergy."],
        allergens: allergenNames,
        ui: {
          allergyAlert: "Allergy Alert",
          iAmAllergicTo: "I am allergic to:",
          pleaseBeCareful: "Please be careful.",
          thankYou: "Thank you.",
          theyMakeMeSick: "They make me sick."
        }
      });
      setIsLoading(false);
    };

    translate();
  }, [languageCode, selectedAllergens, customMessages]);

  return { translatedContent, isLoading };
};