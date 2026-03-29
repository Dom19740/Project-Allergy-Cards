"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { LanguageCode, CustomMessages, TranslatedContent } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText } from '@/lib/translator';
import { shareCard, downloadCard } from '@/lib/card-utils';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import DisclaimerDialog from './DisclaimerDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
  initialTranslations?: TranslatedContent | null;
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens, initialTranslations }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(!initialTranslations);
  
  const [translatedAllergens, setTranslatedAllergens] = useState<{ [key: string]: string }>(initialTranslations?.allergens || {});
  const [translatedUIText, setTranslatedUIText] = useState(initialTranslations?.ui || {
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: "I can not eat:",
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you!",
    theyMakeMeSick: "They make me very sick and I could die"
  });

  const [customMessages, setCustomMessages] = useState<CustomMessages>({
    iAmAllergicTo: "I can not eat:",
    theyMakeMeSick: "They make me very sick and I could die"
  });

  useEffect(() => {
    const loadMessages = async () => {
      const savedAlert = await storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      if (savedAlert) setCustomMessages(savedAlert);
    };
    loadMessages();
  }, []);

  useEffect(() => {
    const performTranslation = async () => {
      if (initialTranslations) {
        setTranslatedUIText(initialTranslations.ui);
        setTranslatedAllergens(initialTranslations.allergens);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      try {
        const [alert, allergicTo, careful, thankYou, theySick] = await Promise.all([
          translateText("ALLERGY ALERT!", languageCode),
          translateText(customMessages.iAmAllergicTo, languageCode),
          translateText("Please be careful with my food.", languageCode),
          translateText("Thank you!", languageCode),
          translateText(customMessages.theyMakeMeSick, languageCode),
        ]);

        setTranslatedUIText({
          allergyAlert: alert,
          iAmAllergicTo: allergicTo,
          pleaseBeCareful: careful,
          thankYou: thankYou,
          theyMakeMeSick: theySick
        });

        const allergenMap: { [key: string]: string } = {};
        for (const id of selectedAllergens) {
          const opt = ALLERGEN_OPTIONS.find(o => o.id === id);
          allergenMap[id] = await translateText(opt ? opt.name : id, languageCode);
        }
        setTranslatedAllergens(allergenMap);
      } catch (e) {
        console.error("Translation failed", e);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [languageCode, selectedAllergens, customMessages, initialTranslations]);

  const handleShare = async () => {
    if (cardRef.current) {
      setIsSharing(true);
      await shareCard(cardRef.current, "Allergy Alert", "My Allergy Alert Card");
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      setIsDownloading(true);
      await downloadCard(cardRef.current, `allergy-card-${languageCode}.png`);
      setIsDownloading(false);
    }
  };

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
        <p className="text-gray-500">Preparing card...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      <div ref={cardRef} className="flex-1 w-full flex flex-col items-center justify-start text-center p-8 bg-white overflow-hidden">
        <div className="h-12" />
        <h1 className="text-5xl font-black text-red-600 uppercase mb-8">{translatedUIText.allergyAlert}</h1>
        <p className="text-3xl font-bold mb-6">{translatedUIText.iAmAllergicTo}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {selectedAllergens.map(id => (
            <span key={id} className="bg-red-600 text-white px-4 py-2 rounded-full text-xl font-bold uppercase">
              {translatedAllergens[id] || id}
            </span>
          ))}
        </div>
        <p className="text-2xl font-medium text-gray-800 mb-4">{translatedUIText.theyMakeMeSick}</p>
        <p className="text-2xl text-gray-500 italic mb-10">{translatedUIText.thankYou}</p>
        
        <div className="relative w-48 h-48 mx-auto mt-auto mb-8">
          <img src="/noentry.png" alt="Forbidden" className="w-full h-full object-contain" />
        </div>
      </div>

      <CardActions 
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={() => window.print()}
        onSave={() => setIsSaveDialogOpen(true)}
        onToggleMenu={() => setIsMenuOpen(true)}
        onEmergency={() => navigate(`/emergency/${languageCode}`)}
        isSharing={isSharing}
        isDownloading={isDownloading}
      />

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)} 
      />
      
      <DisclaimerDialog isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      
      <SaveCardDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        languageCode={languageCode}
        selectedAllergens={{ standard: [], custom: [], ids: selectedAllergens }}
        customMessages={customMessages}
        translatedContent={{
          ui: translatedUIText,
          allergens: translatedAllergens,
          emergency: {
            attention: "ATTENTION",
            emergency: "EMERGENCY",
            needHelp: "I NEED HELP",
            callServices: "CALL SERVICES",
            dial112: "DIAL 112"
          }
        }}
      />
    </div>
  );
};

export default AllergyCard;