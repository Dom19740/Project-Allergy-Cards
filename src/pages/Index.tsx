"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AllergyCard from '@/components/AllergyCard';
import CardActions from '@/components/CardActions';
import CardMenu from '@/components/CardMenu';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import SaveCardDialog from '@/components/SaveCardDialog';
import EmergencyNumberDialog from '@/components/EmergencyNumberDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { shareCard, downloadCard } from '@/lib/card-utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages>({
    iAmAllergicTo: "I can not eat:",
    theyMakeMeSick: "They make me very sick and I could die"
  });
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [languageCode, setLanguageCode] = useState<string>('en');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const allergens = await storage.get<SelectedAllergens>(STORAGE_KEYS.SELECTED_ALLERGENS);
      const messages = await storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      const translations = await storage.get<any>(STORAGE_KEYS.SESSION_TRANSLATIONS);
      
      if (!allergens) {
        navigate('/onboarding');
        return;
      }

      setSelectedAllergens(allergens);
      if (messages) {
        setCustomMessages(messages);
      }
      
      if (translations) {
        setTranslatedContent(translations.content);
        setLanguageCode(translations.languageCode);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    const success = await shareCard(cardRef.current, "My Allergy Card", "Check out my allergy card");
    if (!success) toast.error("Failed to share card.");
    setIsSharing(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    const success = await downloadCard(cardRef.current, "allergy-card.png");
    if (success) toast.success("Card saved to your device!");
    else toast.error("Failed to save card.");
    setIsDownloading(false);
  };

  const handleEmergencyConfirm = (number: string) => {
    setIsEmergencyDialogOpen(false);
    navigate(`/emergency/${languageCode}?num=${encodeURIComponent(number)}`);
  };

  if (isLoading || !selectedAllergens || !translatedContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-24">
        <div ref={cardRef} className="w-full max-w-md">
          <AllergyCard 
            languageCode={languageCode}
            selectedAllergens={selectedAllergens.ids}
            initialTranslations={translatedContent}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <CardActions 
          onShare={handleShare}
          onDownload={handleDownload}
          onPrint={() => window.print()}
          onSave={() => setIsSaveDialogOpen(true)}
          onToggleMenu={() => setIsMenuOpen(true)}
          onEmergency={() => setIsEmergencyDialogOpen(true)}
          isSharing={isSharing}
          isDownloading={isDownloading}
        />
      </div>

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      <DisclaimerDialog 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />

      <SaveCardDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        languageCode={languageCode}
        selectedAllergens={selectedAllergens}
        customMessages={customMessages}
        translatedContent={translatedContent}
      />

      <EmergencyNumberDialog
        isOpen={isEmergencyDialogOpen}
        onClose={() => setIsEmergencyDialogOpen(false)}
        onConfirm={handleEmergencyConfirm}
        langCode={languageCode}
      />
    </div>
  );
};

export default Index;