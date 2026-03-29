"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { shareCard, downloadCard, printCard } from '@/lib/card-utils';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard, TranslatedContent } from '@/lib/types';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import { toast } from 'sonner';

interface AllergyCardProps {
  languageCode: string;
  selectedAllergens: string[];
  initialTranslations: TranslatedContent;
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens, initialTranslations }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSave = async () => {
    const cardToSave: SavedCard = {
      id: crypto.randomUUID(),
      name: `Allergy Card (${languageCode.toUpperCase()})`,
      selectedAllergens: { standard: [], custom: selectedAllergens, ids: selectedAllergens },
      customMessages: { iAmAllergicTo: "I can not eat:", theyMakeMeSick: "They make me sick" },
      languageCode,
      createdAt: new Date().toISOString()
    };

    const currentCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
    await storage.set(STORAGE_KEYS.SAVED_CARDS, [...currentCards, cardToSave]);
    toast.success("Card saved successfully!");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow p-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-t-8 border-red-600 text-left">
          <h2 className="text-3xl font-black text-red-600 mb-4">{initialTranslations.ui.allergyAlert}</h2>
          <p className="text-xl font-bold mb-4">{initialTranslations.ui.iAmAllergicTo}</p>
          <ul className="space-y-2 mb-6">
            {selectedAllergens.map(id => (
              <li key={id} className="text-2xl font-black uppercase text-gray-800 dark:text-gray-100">• {id}</li>
            ))}
          </ul>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium italic">{initialTranslations.ui.theyMakeMeSick}</p>
        </div>
      </div>

      <CardActions 
        onShare={() => shareCard(selectedAllergens, [], languageCode)}
        onDownload={() => downloadCard(selectedAllergens, [], languageCode)}
        onPrint={() => printCard(selectedAllergens, [], languageCode)}
        onSave={handleSave}
        onToggleMenu={() => setIsMenuOpen(true)}
        onEmergency={() => navigate(`/emergency/${languageCode}`)}
        isSharing={isSharing}
        isDownloading={isDownloading}
        fromWidget={false}
        onOpenApp={() => navigate('/')}
      />

      <CardMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onDelete={async () => {
          toast.info("Delete functionality would go here");
        }}
        onEdit={() => navigate('/select-allergens')}
        fromWidget={false}
      />
    </div>
  );
};

export default AllergyCard;