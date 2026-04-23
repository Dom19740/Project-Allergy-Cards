"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import AllergyCard from '@/components/AllergyCard';
import FixedHeader from '@/components/FixedHeader';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens>({});
  const [customMessages, setCustomMessages] = useState<CustomMessages>({});
  const [languageCode, setLanguageCode] = useState('en');
  
  const { translatedContent } = useTranslation(languageCode, selectedAllergens, customMessages);

  useEffect(() => {
    const loadData = async () => {
      const allergens = storage.get<SelectedAllergens>(STORAGE_KEYS.SELECTED_ALLERGENS);
      const messages = storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      const lang = storage.get<string>(STORAGE_KEYS.LANGUAGE);

      if (allergens) setSelectedAllergens(allergens);
      if (messages) setCustomMessages(messages);
      if (lang) setLanguageCode(lang);
    };

    loadData();
  }, []);

  const defaultTranslations: TranslatedContent = {
    title: "EMERGENCY ALERT",
    alerts: ["I am having a severe allergic reaction!"],
    allergens: [],
    ui: { 
      allergyAlert: "Allergy Alert", 
      iAmAllergicTo: "I am allergic to:", 
      pleaseBeCareful: "Please be careful.", 
      thankYou: "Thank you.", 
      theyMakeMeSick: "They make me sick." 
    },
    emergency: {
      title: "Emergency",
      subtitle: "Medical Information",
      callEmergency: "Call Emergency Services",
      medicalInfo: "Medical Info",
      dial112: "112",
      attention: "Attention",
      emergency: "Emergency",
      needHelp: "I need help",
      callServices: "Call Services",
      dialText: "Dial"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-50 dark:bg-red-950/20">
      <FixedHeader />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg text-center">
            <h1 className="text-3xl font-black uppercase mb-2">Emergency</h1>
            <p className="font-bold opacity-90">I need immediate medical assistance!</p>
          </div>

          <AllergyCard 
            languageCode={languageCode}
            translatedData={translatedContent || defaultTranslations}
          />

          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default EmergencyPage;