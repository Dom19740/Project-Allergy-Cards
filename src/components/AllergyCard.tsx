"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Utensils, AlertTriangle } from 'lucide-react';
import { LanguageCode, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText, TranslationError } from '@/lib/translator';
import { shareCard, downloadCard } from '@/lib/card-utils';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import DisclaimerDialog from './DisclaimerDialog';
import EmergencyNumberDialog from './EmergencyNumberDialog';
import FullscreenImageOverlay from './FullscreenImageOverlay';
import AllergenDetailOverlay from './AllergenDetailOverlay';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { resolveCustomMessages, computeContentSignature, DEFAULT_CUSTOM_MESSAGES } from '@/lib/customMessages';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useBilling } from '@/hooks/useBilling';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
  initialTranslations?: TranslatedContent | null;
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens, initialTranslations }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { isPremium } = useBilling();
  
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [selectedPillIndex, setSelectedPillIndex] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [customAllergenTranslations, setCustomAllergenTranslations] = useState<{ [key: string]: { [lang: string]: string } }>({});
  const [translatedAllergens, setTranslatedAllergens] = useState<{ [key: string]: string }>(initialTranslations?.allergens || {});
  const [isTranslating, setIsTranslating] = useState(!initialTranslations);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [customTranslationWarning, setCustomTranslationWarning] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const [fullSelectedData, setFullSelectedData] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages>(DEFAULT_CUSTOM_MESSAGES);
  const [translatedUIText, setTranslatedUIText] = useState(initialTranslations?.ui || {
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo,
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you!",
    theyMakeMeSick: DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick
  });
  const [emergencyTranslations, setEmergencyTranslations] = useState(initialTranslations?.emergency || {
    attention: "ATTENTION",
    emergency: "I am having a severe allergic reaction.",
    needHelp: "I need medical help immediately.",
    callServices: "Please call emergency services.",
    dial112: "DIAL 112"
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLanguageName = (code: string) => {
    if (code === 'en') return 'English';
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      const name = displayNames.of(code);
      return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
    } catch (e) {
      return code;
    }
  };

  const loadData = async () => {
    const storedAllergens = await storage.get<SelectedAllergens>(STORAGE_KEYS.SELECTED_ALLERGENS);
    if (storedAllergens) {
      setFullSelectedData(storedAllergens);
      const custom = storedAllergens.custom || {};
      setCustomAllergenTranslations(custom);
    }

    const savedAlert = await storage.get<Partial<CustomMessages>>(STORAGE_KEYS.CUSTOM_MESSAGES);
    setCustomMessages(resolveCustomMessages(savedAlert));
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, [languageCode, selectedAllergens]);

  useEffect(() => {
    setShowOriginal(false);
  }, [languageCode]);

  const translateAllContent = useCallback(async () => {
      if (initialTranslations) {
        setTranslatedUIText(initialTranslations.ui);
        setTranslatedAllergens(initialTranslations.allergens);
        setEmergencyTranslations(initialTranslations.emergency);
        setIsTranslating(false);
        return;
      }

      const contentSignature = computeContentSignature(customMessages, selectedAllergens);
      const sessionTranslations = await storage.get<any>(STORAGE_KEYS.SESSION_TRANSLATIONS);
      if (
        sessionTranslations &&
        sessionTranslations.languageCode === languageCode &&
        sessionTranslations.signature === contentSignature
      ) {
        setTranslatedUIText(sessionTranslations.content.ui);
        setTranslatedAllergens(sessionTranslations.content.allergens);
        setEmergencyTranslations(sessionTranslations.content.emergency);
        setIsTranslating(false);
        return;
      }

      if (!isOnline && languageCode !== 'en') {
        setIsTranslating(false);
        return;
      }

      if (!languageCode || languageCode === 'en') {
        setTranslatedUIText({
          allergyAlert: "ALLERGY ALERT!",
          iAmAllergicTo: customMessages.iAmAllergicTo,
          pleaseBeCareful: "Please be careful with my food.",
          thankYou: "Thank you!",
          theyMakeMeSick: customMessages.theyMakeMeSick
        });

        const allergenTranslations: { [key: string]: string } = {};
        for (const allergenId of selectedAllergens) {
          const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
          if (predefinedAllergen) {
            allergenTranslations[allergenId] = predefinedAllergen.name;
          } else {
            allergenTranslations[allergenId] = customAllergenTranslations[allergenId]?.[languageCode] || allergenId;
          }
        }
        setTranslatedAllergens(allergenTranslations);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      setTranslationError(null);
      setCustomTranslationWarning(null);

      // Custom allergen names and custom alert text are free-typed by the
      // user, so they usually aren't covered by the local dictionaries and
      // need a live translation. If that fails we don't block the whole
      // card on it: a custom allergen name has no substitute, so we keep
      // the original English text for just that item; a custom alert
      // message does have a substitute (our default wording, which is
      // always dictionary-covered), so we translate that instead.
      const failedCustomKinds = new Set<'allergen' | 'alert'>();
      const translateAllergenOrFallback = async (text: string): Promise<string> => {
        try {
          return await translateText(text, languageCode);
        } catch (error) {
          if (error instanceof TranslationError) {
            failedCustomKinds.add('allergen');
            return text;
          }
          throw error;
        }
      };
      const translateAlertField = async (customText: string, defaultText: string): Promise<string> => {
        try {
          return await translateText(customText, languageCode);
        } catch (error) {
          if (!(error instanceof TranslationError)) throw error;
          failedCustomKinds.add('alert');
          return translateText(defaultText, languageCode);
        }
      };

      try {
        // Standard, fixed phrases - these are always expected to be covered
        // by the local dictionaries, so a failure here blocks the card:
        // there's no sensible fallback for the core safety instructions.
        const [alert, careful, thankYou, att, em, help, call, dial] = await Promise.all([
          translateText("ALLERGY ALERT!", languageCode),
          translateText("Please be careful with my food.", languageCode),
          translateText("Thank you!", languageCode),
          translateText("ATTENTION", languageCode),
          translateText("I am having a severe allergic reaction.", languageCode),
          translateText("I need medical help immediately.", languageCode),
          translateText("Please call emergency services.", languageCode),
          translateText("DIAL 112", languageCode)
        ]);

        const [allergicTo, theyMeSick] = await Promise.all([
          customMessages.iAmAllergicTo
            ? translateAlertField(customMessages.iAmAllergicTo, DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo)
            : Promise.resolve(""),
          customMessages.theyMakeMeSick
            ? translateAlertField(customMessages.theyMakeMeSick, DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick)
            : Promise.resolve("")
        ]);

        const uiText = {
          allergyAlert: alert,
          iAmAllergicTo: customMessages.iAmAllergicTo ? allergicTo : "",
          pleaseBeCareful: careful,
          thankYou: thankYou,
          theyMakeMeSick: customMessages.theyMakeMeSick ? theyMeSick : ""
        };
        setTranslatedUIText(uiText);

        const emergencyText = {
          attention: att,
          emergency: em,
          needHelp: help,
          callServices: call,
          dial112: dial
        };
        setEmergencyTranslations(emergencyText);

        const allergenTranslations: { [key: string]: string } = {};
        for (const allergenId of selectedAllergens) {
          const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
          if (predefinedAllergen) {
            allergenTranslations[allergenId] = await translateText(predefinedAllergen.name, languageCode);
          } else if (customAllergenTranslations[allergenId]?.[languageCode]) {
            allergenTranslations[allergenId] = customAllergenTranslations[allergenId][languageCode];
          } else {
            allergenTranslations[allergenId] = await translateAllergenOrFallback(allergenId);
          }
        }
        setTranslatedAllergens(allergenTranslations);

        if (failedCustomKinds.size > 0) {
          const reasons: string[] = [];
          if (failedCustomKinds.has('allergen')) {
            reasons.push("Your custom allergen names couldn't be translated because you're offline, so they'll be left in English.");
          }
          if (failedCustomKinds.has('alert')) {
            reasons.push("Your custom alert text couldn't be translated because you're offline, so we've used our default alert message (translated) instead.");
          }
          setCustomTranslationWarning(reasons.join(' '));
        } else {
          await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
            languageCode,
            signature: contentSignature,
            content: { ui: uiText, allergens: allergenTranslations, emergency: emergencyText }
          });
        }
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
  }, [languageCode, selectedAllergens, customMessages, customAllergenTranslations, initialTranslations, isOnline]);

  useEffect(() => {
    translateAllContent();
  }, [translateAllContent]);

  const waitForNextPaint = () =>
    new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  const handleDownload = async () => {
    if (cardRef.current) {
      if (Capacitor.isNativePlatform()) {
        FirebaseAnalytics.logEvent({
          name: 'download_card_click',
          params: { language: languageCode }
        });
      }

      setIsDownloading(true);
      setIsCapturing(true);
      await waitForNextPaint();
      const success = await downloadCard(cardRef.current, `allergy-card-${languageCode}.png`);
      setIsCapturing(false);
      if (success) toast.success("Allergy card saved to your device!");
      else toast.error("Failed to save card.");
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (cardRef.current) {
      if (Capacitor.isNativePlatform()) {
        FirebaseAnalytics.logEvent({
          name: 'share_card_click',
          params: { language: languageCode }
        });
      }

      setIsSharing(true);
      setIsCapturing(true);
      await waitForNextPaint();
      const shortCode = languageCode.split('-')[0].toUpperCase();
      const shareText = `My Allergy Alert Card (${shortCode}) made with Simple Allergy Alert`;
      const success = await shareCard(cardRef.current, shareText, shareText);
      setIsCapturing(false);
      if (!success) toast.error("Failed to share card.");
      setIsSharing(false);
    }
  };

  const handlePrint = () => window.print();
  
  const handleReadAloud = async () => {
    if (isSpeaking) {
      await TextToSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    const translatedAllergenList = selectedAllergens.map(allergen => 
      translatedAllergens[allergen] || allergen
    );

    const textToRead = [
      translatedUIText.allergyAlert,
      translatedUIText.iAmAllergicTo,
      ...translatedAllergenList,
      translatedUIText.theyMakeMeSick,
      translatedUIText.thankYou
    ].filter(Boolean).join(". ");

    try {
      setIsSpeaking(true);
      await TextToSpeech.speak({
        text: textToRead,
        lang: languageCode,
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

  useEffect(() => {
    return () => {
      TextToSpeech.stop();
    };
  }, []);

  const handleEmergencyClick = () => {
    setIsEmergencyDialogOpen(true);
  };

  const handleEmergencyConfirm = (number: string) => {
    setIsEmergencyDialogOpen(false);
    navigate(`/emergency/${languageCode}?num=${encodeURIComponent(number)}`);
  };

  const translatedAllergenList = selectedAllergens.map(allergen =>
    translatedAllergens[allergen] || allergen
  );

  const englishAllergenList = selectedAllergens.map(allergenId => {
    const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
    if (predefinedAllergen) return predefinedAllergen.name;
    return customAllergenTranslations[allergenId]?.['en'] || allergenId;
  });

  const englishUIText = {
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: customMessages.iAmAllergicTo,
    thankYou: "Thank you!",
    theyMakeMeSick: customMessages.theyMakeMeSick
  };

  const displayUIText = showOriginal ? englishUIText : translatedUIText;
  const displayAllergenList = showOriginal ? englishAllergenList : translatedAllergenList;

  const allergensWithImages = selectedAllergens
    .map(id => ALLERGEN_OPTIONS.find(option => option.id === id))
    .filter(Boolean) as typeof ALLERGEN_OPTIONS;

  let imageGridClasses = "";
  if (allergensWithImages.length === 1) imageGridClasses = "grid-cols-1 grid-rows-1";
  else if (allergensWithImages.length === 2) imageGridClasses = "grid-cols-2 grid-rows-1";
  else if (allergensWithImages.length <= 4) imageGridClasses = "grid-cols-2 grid-rows-2";
  else if (allergensWithImages.length <= 6) imageGridClasses = "grid-cols-3 grid-rows-2";
  else imageGridClasses = "grid-cols-3 grid-rows-3";

  if (translationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="flex flex-col items-center space-y-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-red-600" />
          <p className="text-lg sm:text-xl font-semibold text-gray-800">Translation failed</p>
          <p className="text-sm text-gray-600">
            We couldn't translate your card into this language. Showing an untranslated card could put you at risk, so we're not displaying it until translation succeeds.
          </p>
          <button
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
            onClick={() => translateAllContent()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (customTranslationWarning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="flex flex-col items-center space-y-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <p className="text-lg sm:text-xl font-semibold text-gray-800">Some text couldn't be translated</p>
          <p className="text-sm text-gray-600">{customTranslationWarning}</p>
          <p className="text-sm text-gray-600">
            The rest of your card was translated normally. You can continue with the card as described above, or try again once you're back online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <button
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              onClick={() => translateAllContent()}
            >
              Try Again
            </button>
            <button
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
              onClick={() => setCustomTranslationWarning(null)}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-lg sm:text-xl md:text-2xl font-normal text-gray-700">Translating your card...</p>
        </div>
      </div>
    );
  }

  const currentTranslatedContent: TranslatedContent = {
    ui: translatedUIText,
    allergens: translatedAllergens,
    emergency: emergencyTranslations
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      <div 
        ref={cardRef} 
        className="flex-1 w-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white border-none"
      >
        <div className="h-6 sm:h-10 md:h-14" />
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-8 md:mb-12 text-red-600 uppercase tracking-tighter whitespace-nowrap">
          {displayUIText.allergyAlert}
        </h1>

        {displayUIText.iAmAllergicTo && (
          <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-4 sm:mb-8 md:mb-12">
            {displayUIText.iAmAllergicTo}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-8 md:mb-12">
          {displayAllergenList.map((allergen, index) => (
            <span
              key={index}
              onClick={() => setSelectedPillIndex(index)}
              className="bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-base sm:text-lg md:text-xl font-normal uppercase cursor-pointer transition-transform duration-150 hover:scale-105"
            >
              {allergen}
            </span>
          ))}
        </div>

        {displayUIText.theyMakeMeSick && (
          <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-2 sm:mb-3 leading-tight max-w-2xl">
            {displayUIText.theyMakeMeSick}
          </p>
        )}

        <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-600 italic mb-4 sm:mb-6">
          {displayUIText.thankYou}
        </p>
        
        <div 
          className="relative w-full max-w-[400px] aspect-square mx-auto flex-shrink min-h-0 cursor-pointer"
          onClick={() => setIsImageFullscreen(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {allergensWithImages.length > 0 ? (
              <div className={`absolute inset-0 grid ${imageGridClasses} gap-1 sm:gap-2 items-center justify-items-center z-0 p-4`}>
                {allergensWithImages.map((allergen) => (
                  <div key={allergen.id} className="w-full h-full flex items-center justify-center">
                    <img src={allergen.image} alt={allergen.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <Utensils className="w-1/2 h-1/2 text-red-600 opacity-20" />
              </div>
            )}
            <img src="/noentry.png" alt="No entry" className="absolute inset-0 w-full h-full object-contain z-10 opacity-90 pointer-events-none" />
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={() => setShowOriginal(prev => !prev)}
            className="inline-flex items-center bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-full px-4 py-1.5 border border-gray-200 shadow-md text-gray-600 text-[14px] sm:text-base font-light mb-0"
          >
            {isCapturing
              ? (showOriginal ? 'English' : getLanguageName(languageCode))
              : showOriginal
                ? `English · See ${getLanguageName(languageCode)}`
                : `${getLanguageName(languageCode)} · See Original`}
          </button>
          {!isPremium && (
            <p className="text-[13px] sm:text-base text-gray-400 font-light">
              created with Simple Allergy Alert © 2026 dpbcreative
            </p>
          )}
        </div>
      </div>
      <CardActions
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSave={() => setIsSaveDialogOpen(true)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onEmergency={handleEmergencyClick}
        onReadAloud={handleReadAloud}
        isSharing={isSharing}
        isDownloading={isDownloading}
        isSpeaking={isSpeaking}
      />
      <CardMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onOpenDisclaimer={() => setIsDisclaimerOpen(true)} />
      <DisclaimerDialog isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      <EmergencyNumberDialog 
        isOpen={isEmergencyDialogOpen} 
        onClose={() => setIsEmergencyDialogOpen(false)} 
        onConfirm={handleEmergencyConfirm}
        langCode={languageCode}
      />
      <FullscreenImageOverlay
        isOpen={isImageFullscreen}
        onClose={() => setIsImageFullscreen(false)}
        allergensWithImages={allergensWithImages}
        imageGridClasses={imageGridClasses}
      />
      <AllergenDetailOverlay
        isOpen={selectedPillIndex !== null}
        onClose={() => setSelectedPillIndex(null)}
        translatedName={selectedPillIndex !== null ? translatedAllergenList[selectedPillIndex] : ''}
        englishName={selectedPillIndex !== null ? englishAllergenList[selectedPillIndex] : ''}
        image={selectedPillIndex !== null ? ALLERGEN_OPTIONS.find(opt => opt.id === selectedAllergens[selectedPillIndex])?.image : undefined}
      />
      {fullSelectedData && (
        <SaveCardDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={languageCode}
          selectedAllergens={fullSelectedData}
          customMessages={customMessages}
          translatedContent={currentTranslatedContent}
        />
      )}
    </div>
  );
};

export default AllergyCard;