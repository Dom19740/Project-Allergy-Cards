"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useToast } from '@/hooks/use-toast';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { LANGUAGES } from '@/constants/languages';
import AllergyCard from '@/components/AllergyCard';
import CardActions from '@/components/CardActions';
import CardMenu from '@/components/CardMenu';
import DisclaimerModal from '@/components/DisclaimerModal';
import html2canvas from 'html2canvas';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAlert, setCustomAlert] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allergens = await storage.get(STORAGE_KEYS.SELECTED_ALLERGENS);
      const custom = await storage.get(STORAGE_KEYS.CUSTOM_MESSAGES);
      
      if (allergens && typeof allergens === 'string') {
        setSelectedAllergens(JSON.parse(allergens));
      }
      
      if (custom && typeof custom === 'string') {
        const parsed = JSON.parse(custom);
        if (langCode && parsed[langCode]) {
          setCustomAlert(parsed[langCode]);
        }
      }
    };
    loadData();
  }, [langCode]);

  const currentLanguage = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const displayLangCode = (langCode || 'en').split('-')[0].toUpperCase();

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `allergy-card-${langCode}.png`;
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: `My Allergy Alert Card (${displayLangCode})- made with Simple Allergy Alert`,
        text: `My Allergy Alert Card (${displayLangCode}) - made with Simple Allergy Alert`,
        url: savedFile.uri,
        dialogTitle: 'Share Allergy Card',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share the card image.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `allergy-card-${langCode}-${Date.now()}.png`;
      
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });

      toast({
        title: "Card Saved",
        description: "The card has been saved to your documents.",
      });
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: "Download failed",
        description: "Could not save the card image.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveCard = async () => {
    try {
      const savedCardsJson = await storage.get(STORAGE_KEYS.SAVED_CARDS);
      const savedCards = (savedCardsJson && typeof savedCardsJson === 'string') 
        ? JSON.parse(savedCardsJson) 
        : [];
      
      const newCard = {
        id: Date.now().toString(),
        languageCode: langCode,
        allergens: selectedAllergens,
        customAlert: customAlert,
        name: `${currentLanguage.name} Card`,
        createdAt: new Date().toISOString(),
      };

      const updatedCards = [newCard, ...savedCards];
      await storage.set(STORAGE_KEYS.SAVED_CARDS, JSON.stringify(updatedCards));
      
      toast({
        title: "Card Saved",
        description: "This card is now available on your home screen.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save card.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-6 pb-32">
        <div ref={cardRef} className="w-full max-w-md">
          <AllergyCard
            languageCode={langCode || 'en'}
            selectedAllergens={selectedAllergens}
            customAlert={customAlert}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <CardActions
          onShare={handleShare}
          onDownload={handleDownload}
          onPrint={() => window.print()}
          onSave={handleSaveCard}
          onToggleMenu={() => setIsMenuOpen(true)}
          onEmergency={() => navigate(`/emergency/${langCode}`)}
          isSharing={isSharing}
          isDownloading={isDownloading}
        />
      </div>

      <CardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default AllergyAlertPage;