"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard, TranslatedContent } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import FixedHeader from '@/components/FixedHeader';
import AllergyCard from '@/components/AllergyCard';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, ChevronLeft } from 'lucide-react';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const [emergencyCard, setEmergencyCard] = useState<SavedCard | null>(null);
  const [languageCode, setLanguageCode] = useState('en');

  useEffect(() => {
    const loadEmergencyCard = async () => {
      const card = await storage.get(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      if (card) {
        setEmergencyCard(card as SavedCard);
        setLanguageCode((card as SavedCard).languageCode);
      }
    };
    loadEmergencyCard();
  }, []);

  const { translatedContent } = useTranslation(
    languageCode, 
    emergencyCard?.selectedAllergens || {}, 
    emergencyCard?.customMessages || {}
  );

  const defaultTranslations: TranslatedContent = {
    title: "EMERGENCY ALERT",
    alerts: ["I am having a severe allergic reaction."],
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
      subtitle: "Medical Assistance Needed",
      callEmergency: "Call Emergency Services",
      medicalInfo: "Medical Information",
      dial112: "112",
      attention: "ATTENTION",
      emergency: "EMERGENCY",
      needHelp: "I NEED HELP",
      callServices: "CALL SERVICES",
      dialText: "DIAL"
    }
  };

  const fullTranslatedContent = translatedContent || defaultTranslations;

  return (
    <div className="flex flex-col min-h-screen bg-red-50 dark:bg-red-950/20">
      <FixedHeader />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-red-600 uppercase tracking-tight">
              {fullTranslatedContent.emergency?.title || "EMERGENCY"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-bold">
              {fullTranslatedContent.emergency?.subtitle || "Medical Assistance Needed"}
            </p>
          </div>

          <AllergyCard 
            data={emergencyCard ? {
              id: emergencyCard.id,
              name: emergencyCard.name,
              allergens: [], // This would need mapping if we had the full allergen list here
              createdAt: emergencyCard.createdAt
            } : undefined}
            translatedData={fullTranslatedContent}
            languageCode={languageCode}
          />

          <div className="space-y-4">
            <Button 
              className="w-full py-8 text-2xl font-black bg-red-600 hover:bg-red-700 text-white rounded-3xl shadow-xl animate-pulse flex items-center justify-center gap-4"
              onClick={() => window.open('tel:112')}
            >
              <Phone className="h-8 w-8 fill-current" />
              {fullTranslatedContent.emergency?.callEmergency || "CALL 112"}
            </Button>
            
            <p className="text-center text-sm text-gray-500 font-medium uppercase tracking-widest">
              Emergency services will be notified of your location
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmergencyPage;