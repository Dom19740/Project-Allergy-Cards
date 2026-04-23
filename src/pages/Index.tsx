"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages, CardData, TranslatedContent, Allergen } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import FixedHeader from '@/components/FixedHeader';
import AllergyCard from '@/components/AllergyCard';
import CardActions from '@/components/CardActions';
import { downloadCard, shareCard } from '@/lib/card-utils';

const Index = () => {
  const navigate = useNavigate();
  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens>({});
  const [customMessages, setCustomMessages] = useState<CustomMessages>({});
  const [languageCode, setLanguageCode] = useState('en');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { translatedContent } = useTranslation(languageCode, selectedAllergens, customMessages);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedAllergens = await storage.get(STORAGE_KEYS.SELECTED_ALLERGENS);
      if (savedAllergens) setSelectedAllergens(savedAllergens as SelectedAllergens);

      const savedLang = await storage.get(STORAGE_KEYS.SELECTED_LANGUAGE);
      if (savedLang) setLanguageCode(savedLang as string);
    };
    loadData();
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      await downloadCard(cardRef.current, `allergy-card-${languageCode}.png`);
      toast.success("Card downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download card.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      await shareCard(cardRef.current, `allergy-card-${languageCode}.png`);
    } catch (error) {
      toast.error("Failed to share card.");
    } finally {
      setIsSharing(false);
    }
  };

  // Map ALLERGEN_OPTIONS to include 'icon' property if it uses 'image'
  const mappedAllergens: Allergen[] = ALLERGEN_OPTIONS.map(a => ({
    ...a,
    icon: a.image || ''
  }));

  const currentCardData: CardData = {
    id: 'current',
    name: 'My Card',
    allergens: mappedAllergens.filter(a => selectedAllergens[a.id]),
    createdAt: Date.now()
  };

  const currentTranslatedData: TranslatedContent = translatedContent || {
    title: "ALLERGY ALERT",
    alerts: ["I have a severe food allergy."],
    allergens: mappedAllergens.filter(a => selectedAllergens[a.id]).map(a => a.name)
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixedHeader />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-32">
        <div ref={cardRef}>
          <AllergyCard 
            data={currentCardData}
            translatedData={currentTranslatedData}
            languageCode={languageCode}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
          <CardActions 
            onShare={handleShare}
            onDownload={handleDownload}
            onPrint={() => window.print()}
            onSave={() => toast.success("Card is already saved!")}
            onEmergency={() => navigate('/emergency')}
            cardData={currentCardData}
            translatedData={currentTranslatedData}
            languageCode={languageCode}
            isSharing={isSharing}
            isDownloading={isDownloading}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;