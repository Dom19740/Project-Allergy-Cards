"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';
import { translateText, TranslationError } from '@/lib/translator';
import { getEmergencyNumber } from '@/lib/emergencyNumbers';
import { SUPPORTED_LANGUAGES } from '@/lib/supportedLanguages';
import { shareCard, downloadCard } from '@/lib/card-utils';
import EmergencyActions from '@/components/EmergencyActions';
import SaveCardDialog from '@/components/SaveCardDialog';
import CardMenu from '@/components/CardMenu';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import UnderstandCardDialog from '@/components/UnderstandCardDialog';
import EmergencyNumberDialog from '@/components/EmergencyNumberDialog';
import { toast } from 'sonner';
import EmergencyCrossIcon from '@/components/EmergencyCrossIcon';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SelectedAllergens, CustomMessages, TranslatedContent, SavedCard } from '@/lib/types';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { speakText } from '@/lib/tts';
import { useBilling } from '@/hooks/useBilling';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const { isPremium } = useBilling();
  const isOnline = useNetworkStatus();

  const [isTranslating, setIsTranslating] = useState(true);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isUnderstandCardOpen, setIsUnderstandCardOpen] = useState(false);
  const [isEmergencyNumberDialogOpen, setIsEmergencyNumberDialogOpen] = useState(false);

  const [selectedAllergens, setSelectedAllergens] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages | null>(null);
  const [fullTranslatedContent, setFullTranslatedContent] = useState<TranslatedContent | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  // Use the number from URL if available, otherwise fallback to default for language
  const emergencyNumber = searchParams.get('num') || getEmergencyNumber(langCode);

  const englishText = {
    attention: "ATTENTION",
    emergency: "I am having a severe allergic reaction.",
    needHelp: "I need medical help immediately.",
    callServices: "Please call emergency services.",
    dialText: "CALL"
  };

  const [translatedText, setTranslatedText] = useState(englishText);

  const displayText = showOriginal ? englishText : translatedText;

  const getLanguageName = (code: string) => {
    if (!code || code === 'en') return 'English';
    // Prefer our own supported-language list over Intl.DisplayNames: some
    // browsers/WebViews ship reduced ICU data that doesn't cover less common
    // languages (e.g. Sindhi), silently returning the code itself instead of
    // throwing, which then got capitalized into something like "Sd".
    const known = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (known) return known.name;
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      const name = displayNames.of(code);
      return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
    } catch (e) {
      return code;
    }
  };

  useEffect(() => {
    setShowOriginal(false);
  }, [langCode]);

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
      await speakText(textToRead, langCode || 'en');
    } catch (error) {
      console.error('TTS Error:', error);
      if (!isOnline) {
        toast.error("Read aloud isn't available for this language while you're offline. Reconnect and try again.");
      } else {
        toast.error("Read aloud isn't supported for this language on your device.");
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleEmergencyNumberConfirm = async (number: string) => {
    setIsEmergencyNumberDialogOpen(false);
    await storage.set(STORAGE_KEYS.VERIFIED_EMERGENCY_NUMBER, { languageCode: langCode || 'en', number });
    navigate(`/emergency/${langCode}?num=${encodeURIComponent(number)}`);
  };

  const handleSave = () => {
    if (!selectedAllergens || !customMessages) {
      toast.error("Missing allergen data to save card.");
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const cardTranslatedContent: TranslatedContent = fullTranslatedContent || {
    ui: { allergyAlert: "Allergy Alert", iAmAllergicTo: "I am allergic to:", pleaseBeCareful: "Please be careful.", thankYou: "Thank you.", theyMakeMeSick: "They make me sick." },
    allergens: {},
    emergency: { ...translatedText, dial112: `${translatedText.dialText} ${emergencyNumber}` }
  };

  useEffect(() => {
    return () => {
      TextToSpeech.stop();
    };
  }, []);

  // Every user gets one emergency card saved automatically the first time
  // they generate one - this is a safety feature, not gated behind premium
  // like manual saves are. It only fires once: if a card already exists
  // (auto-saved earlier, or manually saved/renamed since), later visits to
  // this page must not silently clobber it - only an explicit manual save
  // (via SaveCardDialog) should overwrite it after that.
  useEffect(() => {
    if (isTranslating || !selectedAllergens || !customMessages) return;

    const autoSaveIfMissing = async () => {
      const existing = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      if (existing) return;

      const newCard: SavedCard = {
        id: 'emergency-slot',
        name: 'Emergency Card',
        languageCode: langCode || 'en',
        selectedAllergens,
        customMessages,
        translatedContent: cardTranslatedContent,
        createdAt: Date.now()
      };

      await storage.set(STORAGE_KEYS.SAVED_EMERGENCY_CARD, newCard);
      window.dispatchEvent(new CustomEvent('storage-update'));
      toast.info("Your Emergency Card has been saved automatically for quick access.");
    };

    autoSaveIfMissing();
  }, [isTranslating, selectedAllergens, customMessages, langCode, cardTranslatedContent]);

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
            className="px-6 py-3 bg-red-700 hover:bg-red-800 active:bg-red-600 text-white rounded-lg font-semibold transition-colors"
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
      <div ref={cardRef} className="flex-1 min-h-0 w-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white border-none">
        <div className="h-4 sm:h-10 md:h-14 shrink-0" />
        <div className="bg-white border-4 border-black p-3 sm:p-6 rounded-full shadow-lg mb-4 sm:mb-10 shrink-0">
          <EmergencyCrossIcon className="h-8 w-8 sm:h-16 sm:w-16" />
        </div>
        <div className="w-full max-w-2xl space-y-3 sm:space-y-10 shrink">
          <div className="border-b-4 border-red-600 pb-2 sm:pb-4">
            <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-red-600">{displayText.attention}</h1>
          </div>
          <div className="space-y-2 sm:space-y-8">
            <p className="text-xl sm:text-4xl font-bold text-gray-900 leading-tight">{displayText.emergency}</p>
            <p className="text-xl sm:text-4xl font-bold text-gray-900 leading-tight">{displayText.needHelp}</p>
            <p className="text-xl sm:text-4xl font-bold text-red-700 leading-tight">{displayText.callServices}</p>
          </div>
        </div>
        <div className="mt-auto w-full max-w-md pt-4 shrink-0">
          <a href={`tel:${emergencyNumber}`} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 w-full py-2.5 sm:py-6 px-6 bg-red-700 hover:bg-red-800 active:bg-red-600 text-white rounded-2xl text-xl sm:text-3xl font-black shadow-xl transition-transform active:scale-95 text-center">
            <Phone className="h-6 w-6 sm:h-10 sm:w-10 fill-current shrink-0" />
            <span className="leading-tight break-words">{displayText.dialText} {emergencyNumber}</span>
          </a>
          {langCode && langCode !== 'en' && (
            <p className="text-[14px] sm:text-[32px] text-gray-400 font-light mt-2">
              Translated to {getLanguageName(langCode)}
            </p>
          )}
          {!isPremium && (
            <p className="text-[13px] sm:text-base text-gray-400 font-light mt-1">
              created with Simple Allergy Alert © 2026
            </p>
          )}
        </div>
      </div>

      <EmergencyActions
        onBack={() => navigate(`/alert/${langCode}`)}
        onShare={handleShare}
        onDownload={handleDownload}
        onToggleMenu={() => setIsMenuOpen(true)}
        onReadAloud={handleReadAloud}
        onToggleOriginal={() => setShowOriginal(prev => !prev)}
        showOriginal={showOriginal}
        languageName={getLanguageName(langCode || 'en')}
        onSave={handleSave}
        isSharing={isSharing}
        isDownloading={isDownloading}
        isSpeaking={isSpeaking}
      />

      <CardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onOpenUnderstandCard={() => setIsUnderstandCardOpen(true)}
        onResetEmergencyNumber={() => setIsEmergencyNumberDialogOpen(true)}
        isEmergency={true}
      />

      <DisclaimerDialog
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      <UnderstandCardDialog
        isOpen={isUnderstandCardOpen}
        onClose={() => setIsUnderstandCardOpen(false)}
      />

      <EmergencyNumberDialog
        isOpen={isEmergencyNumberDialogOpen}
        onClose={() => setIsEmergencyNumberDialogOpen(false)}
        onConfirm={handleEmergencyNumberConfirm}
        langCode={langCode || 'en'}
      />

      {selectedAllergens && customMessages && (
        <SaveCardDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={langCode || 'en'}
          selectedAllergens={selectedAllergens}
          customMessages={customMessages}
          isEmergency={true}
          translatedContent={cardTranslatedContent}
        />
      )}
    </div>
  );
};

export default EmergencyPage;