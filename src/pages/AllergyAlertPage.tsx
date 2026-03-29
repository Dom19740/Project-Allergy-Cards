"use client";

import React from 'react';
import { useParams } from 'react-router-dom';
import AllergyCard from '@/components/AllergyCard';
import { TranslatedContent } from '@/lib/types';
import NotFound from './NotFound';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();

  if (!langCode) return <NotFound />;

  const dummyTranslations: TranslatedContent = {
    ui: {
      allergyAlert: "ALLERGY ALERT",
      iAmAllergicTo: "I am allergic to:",
      pleaseBeCareful: "Please be careful",
      thankYou: "Thank you",
      theyMakeMeSick: "They make me very sick."
    },
    allergens: {},
    emergency: {
      attention: "ATTENTION",
      emergency: "EMERGENCY",
      needHelp: "I need help",
      callServices: "Call services",
      dial112: "Dial 112"
    }
  };

  const storedAllergensStr = localStorage.getItem('selectedAllergens');
  const selectedAllergens = storedAllergensStr ? JSON.parse(storedAllergensStr).ids : [];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <AllergyCard
        languageCode={langCode}
        selectedAllergens={selectedAllergens}
        initialTranslations={dummyTranslations}
      />
    </div>
  );
};

export default AllergyAlertPage;