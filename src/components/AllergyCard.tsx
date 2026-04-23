"use client";

import React, { useRef } from 'react';
import { CardData, TranslatedContent } from '@/lib/types';
import { getLanguageName } from '@/lib/languages';
import { downloadCard, shareCard } from '@/lib/card-utils';
import CardActions from './CardActions';

interface AllergyCardProps {
  data?: CardData;
  translatedData?: TranslatedContent;
  languageCode: string;
  // Added to fix TS error in AllergyAlertPage
  selectedAllergens?: string[];
  initialTranslations?: TranslatedContent;
}

const AllergyCard = ({ 
  data, 
  translatedData, 
  languageCode,
  selectedAllergens,
  initialTranslations 
}: AllergyCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use initialTranslations if translatedData is not provided
  const displayData = translatedData || initialTranslations || {
    title: "ALLERGY ALERT",
    alerts: ["I have a severe food allergy."],
    allergens: []
  };

  const handleDownload = () => {
    if (cardRef.current) {
      downloadCard(cardRef.current, `allergy-card-${languageCode}.png`);
    }
  };

  const handleShare = () => {
    if (cardRef.current) {
      shareCard(cardRef.current, `allergy-card-${languageCode}.png`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        ref={cardRef}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border-4 border-red-600 relative"
      >
        {/* Card Header */}
        <div className="bg-red-600 p-4 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {displayData.title}
          </h2>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-6">
          {/* Alerts Section */}
          <div className="space-y-3">
            {displayData.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {alert}
                </p>
              </div>
            ))}
          </div>

          {/* Allergens Grid */}
          <div className="grid grid-cols-2 gap-4">
            {data?.allergens.map((allergen) => (
              <div 
                key={allergen.id}
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <img 
                  src={allergen.icon} 
                  alt={allergen.name}
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-bold text-center text-gray-900 dark:text-white">
                  {displayData.allergens.find(a => a.toLowerCase().includes(allergen.name.toLowerCase())) || allergen.name}
                </span>
              </div>
            ))}
          </div>

          {/* Watermark */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-40">
            <span className="text-[10px] font-medium uppercase tracking-widest">Simple Allergy Alert</span>
            <span className="text-[10px] font-medium uppercase tracking-widest">{getLanguageName(languageCode)}</span>
          </div>
        </div>
      </div>

      <CardActions 
        onShare={handleShare} 
        onDownload={handleDownload} 
        cardData={data || { id: 'temp', name: 'Card', allergens: [], createdAt: Date.now() }}
        translatedData={displayData}
        languageCode={languageCode}
      />
    </div>
  );
};

export default AllergyCard;