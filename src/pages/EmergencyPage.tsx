"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';
import { translateText, TranslationError } from '@/lib/translator';
import { getEmergencyNumber } from '@/lib/emergencyNumbers';
import { shareCard, downloadCard } from '@/lib/card-utils';
import EmergencyActions from '@/components/EmergencyActions';
import SaveCardDialog from '@/components/SaveCardDialog';
import CardMenu from '@/components/CardMenu';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isTranslating, setIsTranslating] = useState(true);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  
  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages | null>(null);
  const [fullTranslatedContent, setFullTranslatedContent] = useState<TranslatedContent | null>(null);

  // Use the number from URL if available, otherwise fallback to default for language
  const emergencyNumber = searchParams.get('num') || getEmergencyNumber(langCode);
  
  const [translatedText, setTranslatedText] = useState({
    attention: "ATTENTION",
    emergency: "I am having a severe allergic reaction.",
    needHelp: "I need medical help immediately.",
    callServices: "Please call emergency services.",
    dialText: "CALL"
  });

  const loadDataAndTranslate = useCallback(async () => {
      if (langCode) {
        await storage.set(STORAGE_KEYS.LAST_EMERGENCY_LANG, langCode);
      }

      const allergens = await storage.get<SelectedAllergens>(STORAGE_KEYS.SELECTED_ALLERGENS);
      const messages = await storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      setSelectedAllergens(allergens);
      setCustomMessages(messages);

      const sessionTranslations = await storage.get<any>(STORAGE_KEYS.SESSION_TRANSLATIONS);
      if (sessionTranslations && sessionTranslations.languageCode === langCode) {
        const content = sessionTranslations.content.emergency;
        setTranslatedText({
          attention: content.attention,
          emergency: content.emergency,
          needHelp: content.needHelp,
          callServices: content.callServices,
          dialText: content.dial112?.replace(/\d+/g, '').trim() || "CALL"
        });
        setFullTranslatedContent(sessionTranslations.content);
        setIsTranslating(false);
        return;
      }

      if (!langCode || langCode === 'en') {
        setIsTranslating(false);
        return;
      }

      setTranslationError(null);
      try {
        const [attention, emergency, needHelp, callServices, dialText] = await Promise.all([
          translateText("ATTENTION", langCode),
          translateText("I am having a severe allergic reaction.", langCode),
          translateText("I need medical help immediately.", langCode),
          translateText("Please call emergency services.", langCode),
          translateText("CALL", langCode)
        ]);

        setTranslatedText({ attention, emergency, needHelp, callServices, dialText });
      } catch (error) {
        if (error instanceof TranslationError) {
          console.error('Translation failed:', error.message);
          setTranslationError(error.message);
        } else {
          console.error('Translation failed:', error);
        }
      } finally {
        setIsTranslating(false);
      }
  }, [langCode]);

  useEffect(() => {
    loadDataAndTranslate();
  }, [loadDataAndTranslate]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    const shortCode = (langCode || 'EN').split('-')[0].toUpperCase();
    const success = await shareCard(cardRef.current, `Emergency Alert (${shortCode})`, `Emergency Alert (${shortCode})`);
    if (!success) toast.error("Failed to share emergency message.");
    setIsSharing(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    const success = await downloadCard(cardRef.current, `emergency-message-${langCode || 'en'}.png`);
    if (success) toast.success("Emergency message saved!");
    else toast.error("Failed to save emergency message.");
    setIsDownloading(false);
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      await TextToSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToRead = [
      translatedText.attention,
      translatedText.emergency,
      translatedText.needHelp,
      translatedText.callServices
    ].join(". ");

    try {
      setIsSpeaking(true);
      await TextToSpeech.speak({
        text: textToRead,
        lang: langCode || 'en',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error("Speech failed. Please check your device volume and settings.");
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSave = () => {
    if (!selectedAllergens || !customMessages) {
      toast.error("Missing allergen data to save card.");
      return;
    }
    setIsSaveDialogOpen(true);
  };

  useEffect(() => {
    return () => {
      TextToSpeech.stop();
    };
  }, []);

  if (translationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="flex flex-col items-center space-y-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-red-600" />
          <p className="text-xl font-semibold text-gray-800">Translation failed</p>
          <p className="text-sm text-gray-600">
            We couldn't translate this emergency message into this language. Showing an untranslated message could put you at risk, so we're not displaying it until translation succeeds.
          </p>
          <button
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
            onClick={() => { setIsTranslating(true); loadDataAndTranslate(); }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
      <div ref={cardRef} className="flex-1 w-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white border-none">
        <div className="h-6 sm:h-10 md:h-14" />
        <div className="bg-red-600 p-4 sm:p-6 rounded-full shadow-lg mb-6 sm:mb-10">
          <AlertTriangle className="h-10 w-10 sm:h-16 sm:w-16 text-white" />
        </div>
        <div className="w-full max-w-2xl space-y-6 sm:space-y-10">
          <div className="border-b-4 border-red-600 pb-2 sm:pb-4">
            <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-red-600">{translatedText.attention}</h1>
          </div>
          <div className="space-y-4 sm:space-y-8">
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">{translatedText.emergency}</p>
            <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">{translatedText.needHelp}</p>
            <p className="text-2xl sm:text-4xl font-bold text-red-700 leading-tight">{translatedText.callServices}</p>
          </div>
        </div>
        <div className="mt-auto w-full max-w-md pt-6">
          <a href={`tel:${emergencyNumber}`} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full py-4 sm:py-6 px-6 bg-red-700 hover:bg-red-500 text-white rounded-2xl text-2xl sm:text-3xl font-black shadow-xl transition-transform active:scale-95 text-center">
            <Phone className="h-8 w-8 sm:h-10 sm:w-10 fill-current shrink-0" />
            <span className="leading-tight break-words">{translatedText.dialText} {emergencyNumber}</span>
          </a>
        </div>
      </div>
      
      <EmergencyActions 
        onBack={() => navigate(-1)} 
        onShare={handleShare} 
        onDownload={handleDownload} 
        onToggleMenu={() => setIsMenuOpen(true)}
        onReadAloud={handleReadAloud}
        onSave={handleSave} 
        isSharing={isSharing} 
        isDownloading={isDownloading} 
        isSpeaking={isSpeaking}
      />

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        isEmergency={true}
      />

      <DisclaimerDialog 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />

      {selectedAllergens && customMessages && (
        <SaveCardDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={langCode || 'en'}
          selectedAllergens={selectedAllergens}
          customMessages={customMessages}
          isEmergency={true}
          translatedContent={fullTranslatedContent || {
            ui: { allergyAlert: "Allergy Alert", iAmAllergicTo: "I am allergic to:", pleaseBeCareful: "Please be careful.", thankYou: "Thank you.", theyMakeMeSick: "They make me sick." },
            allergens: {},
            emergency: { ...translatedText, dial112: `${translatedText.dialText} ${emergencyNumber}` }
          }}
        />
      )}
    </div>
  );
};

export default EmergencyPage;