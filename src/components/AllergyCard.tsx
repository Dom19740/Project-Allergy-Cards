"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type PanInfo } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Utensils, AlertTriangle } from 'lucide-react';
import { LanguageCode, SelectedAllergens, CustomMessages, TranslatedContent, SavedCard } from '@/lib/types';
import { ALLERGEN_OPTIONS, getAllergenGridStyle } from '@/lib/allergens';
import { translateText, TranslationError } from '@/lib/translator';
import { SUPPORTED_LANGUAGES } from '@/lib/supportedLanguages';
import { shareCard, downloadCard } from '@/lib/card-utils';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import CardSelectorMenu from './CardSelectorMenu';
import DisclaimerDialog from './DisclaimerDialog';
import UnderstandCardDialog from './UnderstandCardDialog';
import EmergencyNumberDialog from './EmergencyNumberDialog';
import FullscreenImageOverlay from './FullscreenImageOverlay';
import AllergenDetailOverlay from './AllergenDetailOverlay';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { getCustomAllergenImages } from '@/lib/customAllergenImages';
import { resolveCustomMessages, computeContentSignature, DEFAULT_CUSTOM_MESSAGES } from '@/lib/customMessages';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useBilling } from '@/hooks/useBilling';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { speakText } from '@/lib/tts';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { isStandalone, getMobileOS } from '@/lib/platform';

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
  const [isUnderstandCardOpen, setIsUnderstandCardOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [selectedPillIndex, setSelectedPillIndex] = useState<number | null>(null);
  const [customAllergenTranslations, setCustomAllergenTranslations] = useState<{ [key: string]: { [lang: string]: string } }>({});
  const [customAllergenImages, setCustomAllergenImages] = useState<Record<string, string>>({});
  const [translatedAllergens, setTranslatedAllergens] = useState<{ [key: string]: string }>(initialTranslations?.allergens || {});
  const [isTranslating, setIsTranslating] = useState(!initialTranslations);
  const [translationError, setTranslationError] = useState<string | null>(null);
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
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [verifiedEmergencyNumber, setVerifiedEmergencyNumber] = useState<string | null>(null);

  const hasMultipleCards = savedCards.length > 1;

  useEffect(() => {
    const loadSavedCards = async () => {
      const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      setSavedCards(cards);
    };
    loadSavedCards();

    window.addEventListener('storage-update', loadSavedCards);
    return () => window.removeEventListener('storage-update', loadSavedCards);
  }, []);

  // The currently displayed card isn't tracked by id (its data lives in
  // loose storage keys, not a SavedCard record) - so to know where it sits
  // in the stack for swipe navigation, match it against the saved cards by
  // language + allergen selection instead.
  const currentCardIndex = useMemo(() => {
    if (savedCards.length === 0) return -1;
    const sortedSelected = [...selectedAllergens].sort();
    return savedCards.findIndex(card => {
      if (card.languageCode !== languageCode) return false;
      const cardIds = [...(card.selectedAllergens?.ids || [])].sort();
      return cardIds.length === sortedSelected.length && cardIds.every((id, i) => id === sortedSelected[i]);
    });
  }, [savedCards, languageCode, selectedAllergens]);

  const switchToCard = async (card: SavedCard) => {
    await Promise.all([
      storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens),
      storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages),
      storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode)
    ]);

    if (card.translatedContent) {
      await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
        languageCode: card.languageCode,
        signature: computeContentSignature(card.customMessages, card.selectedAllergens.ids),
        content: card.translatedContent
      });
    }

    navigate(`/alert/${card.languageCode}`, { replace: true });
  };

  // direction 1 = next card (swipe up), -1 = previous card (swipe down).
  // If the displayed card isn't part of the saved stack, the first swipe
  // lands on the nearest end of the stack instead of an arbitrary card.
  const goToAdjacentCard = (direction: 1 | -1) => {
    if (savedCards.length < 2) return;
    const baseIndex = currentCardIndex === -1
      ? (direction === 1 ? -1 : savedCards.length)
      : currentCardIndex;
    const nextIndex = baseIndex + direction;
    if (nextIndex < 0 || nextIndex >= savedCards.length) return;
    switchToCard(savedCards[nextIndex]);
  };

  // A partial/aborted swipe still moves the pointer over the food image or an
  // allergen pill, both of which have their own onClick (open fullscreen /
  // open allergen detail). Without this, any swipe attempt that doesn't cross
  // the card-switch threshold would also fire that click. dragMovedRef tracks
  // whether the current gesture moved enough to count as a drag rather than a
  // tap, so those onClick handlers can ignore it.
  const dragMovedRef = useRef(false);
  const TAP_TOLERANCE = 8;

  const handleCardDragStart = () => {
    dragMovedRef.current = false;
  };

  const handleCardDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.y) > TAP_TOLERANCE || Math.abs(info.offset.x) > TAP_TOLERANCE) {
      dragMovedRef.current = true;
    }
  };

  const handleCardDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const SWIPE_DISTANCE_THRESHOLD = 60;
    const SWIPE_VELOCITY_THRESHOLD = 400;
    if (info.offset.y <= -SWIPE_DISTANCE_THRESHOLD || info.velocity.y <= -SWIPE_VELOCITY_THRESHOLD) {
      goToAdjacentCard(1);
    } else if (info.offset.y >= SWIPE_DISTANCE_THRESHOLD || info.velocity.y >= SWIPE_VELOCITY_THRESHOLD) {
      goToAdjacentCard(-1);
    }
  };

  const withTapGuard = (action: () => void) => () => {
    if (dragMovedRef.current) return;
    action();
  };

  useEffect(() => {
    const loadCustomAllergenImages = () => getCustomAllergenImages().then(setCustomAllergenImages);
    loadCustomAllergenImages();

    window.addEventListener('storage-update', loadCustomAllergenImages);
    return () => window.removeEventListener('storage-update', loadCustomAllergenImages);
  }, []);

  useEffect(() => {
    const loadVerifiedEmergencyNumber = async () => {
      const stored = await storage.get<{ languageCode: string; number: string }>(STORAGE_KEYS.VERIFIED_EMERGENCY_NUMBER);
      setVerifiedEmergencyNumber(stored && stored.languageCode === languageCode ? stored.number : null);
    };
    loadVerifiedEmergencyNumber();
  }, [languageCode]);

  useEffect(() => {
    const checkPendingEmergencyVerification = async () => {
      const flag = await storage.getEphemeral<string>(STORAGE_KEYS.OPEN_EMERGENCY_DIALOG_FLAG);
      if (flag) {
        await storage.removeEphemeral(STORAGE_KEYS.OPEN_EMERGENCY_DIALOG_FLAG);
        setIsEmergencyDialogOpen(true);
      }
    };
    checkPendingEmergencyVerification();
  }, []);

  const getLanguageName = (code: string) => {
    if (code === 'en') return 'English';
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
          toast.warning(reasons.join(' '));
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
      await waitForNextPaint();
      const allergenNames = selectedAllergens.map(allergenId => {
        const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
        if (predefinedAllergen) return predefinedAllergen.name;
        return customAllergenTranslations[allergenId]?.['en'] || allergenId;
      });
      const allergenSlug = allergenNames
        .map(name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
        .filter(Boolean)
        .join('-');
      const fileName = `allergy-card${allergenSlug ? `-${allergenSlug}` : ''}-${languageCode}.png`;
      const success = await downloadCard(cardRef.current, fileName);
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
      await waitForNextPaint();
      const shortCode = languageCode.split('-')[0].toUpperCase();
      const shareText = `My Allergy Alert Card (${shortCode}) made with Simple Allergy Alert`;
      const success = await shareCard(cardRef.current, shareText, shareText);
      if (!success) toast.error("Failed to share card.");
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    // window.print() is a silent no-op in iOS home-screen web apps - there's
    // no Safari chrome around them to host the print dialog. Other installed
    // PWAs (Android/desktop Chrome etc.) print fine in standalone mode, so
    // this is scoped to iOS specifically rather than isStandalone() alone.
    if (getMobileOS() === 'ios' && isStandalone()) {
      toast.info("Printing isn't available in this mode. Try Share instead.");
      return;
    }
    window.print();
  };
  
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
      await speakText(textToRead, languageCode);
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

  useEffect(() => {
    return () => {
      TextToSpeech.stop();
    };
  }, []);

  const handleEmergencyClick = () => {
    if (verifiedEmergencyNumber) {
      navigate(`/emergency/${languageCode}?num=${encodeURIComponent(verifiedEmergencyNumber)}`);
      return;
    }
    setIsEmergencyDialogOpen(true);
  };

  const handleEmergencyConfirm = async (number: string) => {
    setIsEmergencyDialogOpen(false);
    await storage.set(STORAGE_KEYS.VERIFIED_EMERGENCY_NUMBER, { languageCode, number });
    setVerifiedEmergencyNumber(number);
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
    .map(id => {
      const predefined = ALLERGEN_OPTIONS.find(option => option.id === id);
      if (predefined) return predefined;
      const customImage = customAllergenImages[id];
      return customImage ? { id, name: id, image: customImage } : null;
    })
    .filter(Boolean) as typeof ALLERGEN_OPTIONS;

  const imageGridStyle = getAllergenGridStyle(allergensWithImages.length);

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
            className="px-6 py-3 bg-red-700 hover:bg-red-800 active:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            onClick={() => translateAllContent()}
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
      <motion.div
        className="flex-1 min-h-0 w-full flex flex-col"
        drag={hasMultipleCards ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragStart={handleCardDragStart}
        onDrag={handleCardDrag}
        onDragEnd={handleCardDragEnd}
      >
        <div
          ref={cardRef}
          className="print-card flex-1 w-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white border-none"
        >
          <div className="h-6 sm:h-10 md:h-14" />
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-8 md:mb-12 text-red-600 uppercase tracking-tighter break-words">
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
                onClick={withTapGuard(() => setSelectedPillIndex(index))}
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

          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
            <div
              className="relative h-full max-h-[400px] w-auto max-w-full aspect-square cursor-pointer"
              onClick={withTapGuard(() => setIsImageFullscreen(true))}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {allergensWithImages.length > 0 ? (
                  <div className="absolute inset-0 grid gap-1 sm:gap-2 items-center justify-items-center z-0 p-4" style={imageGridStyle}>
                    {allergensWithImages.map((allergen) => (
                      <div key={allergen.id} className="w-full h-full flex items-center justify-center">
                        <img src={allergen.image} alt={allergen.name} draggable={false} className="max-w-full max-h-full object-contain" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <Utensils className="w-1/2 h-1/2 text-red-600 opacity-20" />
                  </div>
                )}
                <img src="/noentry.png" alt="No entry" draggable={false} className="absolute inset-0 w-full h-full object-contain z-10 opacity-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-2">
            {languageCode !== 'en' && (
              <p className="text-[14px] sm:text-[32px] text-gray-400 font-light mb-1">
                Translated to {getLanguageName(languageCode)}
              </p>
            )}
            {!isPremium && (
              <p className="text-[13px] sm:text-base text-gray-400 font-light">
                created with Simple Allergy Alert © 2026
              </p>
            )}
          </div>
        </div>
      </motion.div>
      <CardActions
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSave={() => setIsSaveDialogOpen(true)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenCardSelector={() => setIsCardSelectorOpen(true)}
        showCardSelector={hasMultipleCards}
        onEmergency={handleEmergencyClick}
        onReadAloud={handleReadAloud}
        onToggleOriginal={() => setShowOriginal(prev => !prev)}
        showOriginal={showOriginal}
        languageName={getLanguageName(languageCode)}
        isSharing={isSharing}
        isDownloading={isDownloading}
        isSpeaking={isSpeaking}
      />
      <CardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onOpenUnderstandCard={() => setIsUnderstandCardOpen(true)}
      />
      <CardSelectorMenu isOpen={isCardSelectorOpen} onClose={() => setIsCardSelectorOpen(false)} />
      <DisclaimerDialog isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
      <UnderstandCardDialog isOpen={isUnderstandCardOpen} onClose={() => setIsUnderstandCardOpen(false)} />
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
        imageGridStyle={imageGridStyle}
      />
      <AllergenDetailOverlay
        isOpen={selectedPillIndex !== null}
        onClose={() => setSelectedPillIndex(null)}
        translatedName={selectedPillIndex !== null ? translatedAllergenList[selectedPillIndex] : ''}
        englishName={selectedPillIndex !== null ? englishAllergenList[selectedPillIndex] : ''}
        image={selectedPillIndex !== null
          ? (ALLERGEN_OPTIONS.find(opt => opt.id === selectedAllergens[selectedPillIndex])?.image
              ?? customAllergenImages[selectedAllergens[selectedPillIndex]])
          : undefined}
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