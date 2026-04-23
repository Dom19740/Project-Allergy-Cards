"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldAlert, Plus, Info, Languages, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { shareCard, downloadCard } from '@/lib/card-utils';
import { useBilling } from '@/hooks/useBilling';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import FixedHeader from '@/components/FixedHeader';
import CardActions from '@/components/CardActions';
import CardMenu from '@/components/CardMenu';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import SavedCardsList from '@/components/SavedCardsList';
import EmergencyNumberDialog from '@/components/EmergencyNumberDialog';

const Index = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const { isPremium } = useBilling();
  const isOnline = useNetworkStatus();
  
  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages | null>(null);
  const [languageCode, setLanguageCode] = useState<string>("en");
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [allergens, messages, lang] = await Promise.all([
        storage.get<SelectedAllergens>(STORAGE_KEYS.SELECTED_ALLERGENS),
        storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES),
        storage.get<string>(STORAGE_KEYS.SELECTED_LANGUAGE)
      ]);
      
      setSelectedAllergens(allergens);
      setCustomMessages(messages);
      if (lang) setLanguageCode(lang);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleShare = async () => {
    if (cardRef.current) {
      setIsSharing(true);
      const success = await shareCard(cardRef.current, "My Allergy Alert Card", "Check out my allergy alert card.");
      if (!success) toast.error("Failed to share card.");
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      setIsDownloading(true);
      const success = await downloadCard(cardRef.current, "allergy-card.png");
      if (success) toast.success("Card saved to gallery!");
      else toast.error("Failed to save card.");
      setIsDownloading(false);
    }
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      await TextToSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    if (!selectedAllergens) return;

    const allergenNames = selectedAllergens.ids.map(id => 
      ALLERGEN_OPTIONS.find(opt => opt.id === id)?.name || id
    );

    const textToRead = [
      "Allergy Alert",
      customMessages?.iAmAllergicTo || "I am allergic to",
      ...allergenNames,
      customMessages?.theyMakeMeSick || "They make me very sick",
      "Thank you"
    ].join(". ");

    try {
      setIsSpeaking(true);
      await TextToSpeech.speak({
        text: textToRead,
        lang: 'en-US',
        rate: 0.9,
      });
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleEmergencyClick = () => {
    setIsEmergencyDialogOpen(true);
  };

  const handleEmergencyConfirm = (number: string) => {
    setIsEmergencyDialogOpen(false);
    navigate(`/emergency/${languageCode}?num=${encodeURIComponent(number)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const hasCard = selectedAllergens && selectedAllergens.ids.length > 0;

  return (
    <div className="min-h-screen bg-white pb-32">
      <FixedHeader />
      
      <main className="container mx-auto px-4 pt-24">
        {!hasCard ? (
          <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
            <div className="bg-red-50 p-6 rounded-full">
              <ShieldAlert className="h-16 w-16 text-red-600" />
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-bold text-gray-900">No Allergy Card Yet</h2>
              <p className="text-gray-600 text-lg">
                Create your first allergy alert card to stay safe while traveling or dining out.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/select-allergens')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-xl rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <Plus className="mr-2 h-6 w-6" />
              Create New Card
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Allergy Card</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/select-allergens')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Edit Card
              </Button>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-md transform transition-all hover:scale-[1.02]">
                <SavedCardsList />
              </div>
            </div>
          </div>
        )}
      </main>

      {hasCard && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <CardActions 
            onShare={handleShare}
            onDownload={handleDownload}
            onPrint={() => window.print()}
            onSave={() => toast.success("Card is already saved!")}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            onEmergency={handleEmergencyClick}
            onReadAloud={handleReadAloud}
            isSharing={isSharing}
            isDownloading={isDownloading}
            isSpeaking={isSpeaking}
          />
        </div>
      )}

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)} 
      />
      
      <DisclaimerDialog 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
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