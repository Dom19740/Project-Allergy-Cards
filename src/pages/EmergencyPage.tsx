"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';
import { translateText } from '@/lib/translator';
import { getEmergencyNumber } from '@/lib/emergencyNumbers';
import { shareCard, downloadCard } from '@/lib/card-utils';
import EmergencyActions from '@/components/EmergencyActions';
import { toast } from 'sonner';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isTranslating, setIsTranslating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const emergencyNumber = getEmergencyNumber(langCode);
  
  const [translatedText, setTranslatedText] = useState({
    attention: "ATTENTION",
    emergency: "I am having a severe allergic reaction.",
    needHelp: "I need medical help immediately.",
    callServices: "Please call emergency services.",
    dialText: "DIAL"
  });

  useEffect(() => {
    const translateEmergencyContent = async () => {
      const sessionTranslations = localStorage.getItem('currentSessionTranslations');
      if (sessionTranslations) {
        try {
          const parsed = JSON.parse(sessionTranslations);
          if (parsed.languageCode === langCode) {
            const content = parsed.content.emergency;
            setTranslatedText({
              ...content,
              dialText: content.dialText || "DIAL"
            });
            setIsTranslating(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse session translations", e);
        }
      }

      if (!langCode || langCode === 'en') {
        setIsTranslating(false);
        return;
      }

      try {
        const [attention, emergency, needHelp, callServices, dialText] = await Promise.all([
          translateText("ATTENTION", langCode),
          translateText("I am having a severe allergic reaction.", langCode),
          translateText("I need medical help immediately.", langCode),
          translateText("Please call emergency services.", langCode),
          translateText("DIAL", langCode)
        ]);

        setTranslatedText({
          attention,
          emergency,
          needHelp,
          callServices,
          dialText
        });
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateEmergencyContent();
  }, [langCode]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    // Extract 2-letter code if it's a longer code (e.g., 'es-ES' -> 'ES')
    const shortCode = (langCode || 'EN').split('-')[0].toUpperCase();
    const success = await shareCard(cardRef.current, `My Emergency Alert Card (${shortCode})`);
    if (!success) {
      toast.error("Failed to share emergency message.");
    }
    setIsSharing(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    const success = await downloadCard(cardRef.current, `emergency-message-${langCode || 'en'}.png`);
    if (success) {
      toast.success("Emergency message saved to your device!");
    } else {
      toast.error("Failed to save emergency message.");
    }
    setIsDownloading(false);
  };

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-xl font-medium text-gray-600">Preparing emergency message...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      <div 
        ref={cardRef} 
        className="flex-1 w-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white border-none"
      >
        <div className="h-6 sm:h-10 md:h-14" />

        <div className="bg-red-600 p-4 sm:p-6 rounded-full shadow-lg mb-6 sm:mb-10">
          <AlertTriangle className="h-10 w-10 sm:h-16 sm:w-16 text-white" />
        </div>

        <div className="w-full max-w-2xl space-y-6 sm:space-y-10">
          <div className="border-b-4 border-red-600 pb-2 sm:pb-4">
            <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-red-600">
              {translatedText.attention}
            </h1>
          </div>
          
          <div className="space-y-4 sm:space-y-8">
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {translatedText.emergency}
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {translatedText.needHelp}
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-red-700 leading-tight">
              {translatedText.callServices}
            </p>
          </div>
        </div>

        <div className="mt-auto w-full max-w-md pt-6">
          <a 
            href={`tel:${emergencyNumber}`} 
            className="flex items-center justify-center gap-3 sm:gap-4 w-full py-4 sm:py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-2xl sm:text-3xl font-black shadow-xl transition-transform active:scale-95"
          >
            <Phone className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
            {translatedText.dialText} {emergencyNumber}
          </a>
        </div>
      </div>

      <EmergencyActions 
        onBack={() => navigate(-1)}
        onShare={handleShare}
        onDownload={handleDownload}
        isSharing={isSharing}
        isDownloading={isDownloading}
      />
    </div>
  );
};

export default EmergencyPage;