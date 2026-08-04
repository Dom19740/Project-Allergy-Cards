"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Utensils, AlertTriangle, Phone } from 'lucide-react';
import { LanguageCode, SelectedAllergens, CustomMessages, TranslatedContent, SavedCard } from '@/lib/types';
import { ALLERGEN_OPTIONS, getAllergenGridStyle } from '@/lib/allergens';
import { getEmergencyNumber } from '@/lib/emergencyNumbers';
import { translateText, TranslationError } from '@/lib/translator';
import { SUPPORTED_LANGUAGES } from '@/lib/supportedLanguages';
import { shareCard, downloadCard } from '@/lib/card-utils';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import CardSelectorMenu from './CardSelectorMenu';
import EmergencyCrossIcon from './EmergencyCrossIcon';
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

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 400;
const SWIPE_BOUNCE_SPRING = { type: 'spring' as const, stiffness: 500, damping: 40 };
const SWIPE_SLIDE_TWEEN = { duration: 0.22, ease: 'easeOut' as const };

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode: languageCodeProp, selectedAllergens: selectedAllergensProp, initialTranslations }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { isPremium } = useBilling();

  // Swiping between saved cards writes the target card's data to storage and
  // navigates, but that flows back down as new languageCode/selectedAllergens
  // props asynchronously (through AllergyAlertPage's own storage read) - on
  // a real device, that round-trip goes through the native storage bridge
  // and has genuine latency, not just a local variable read. Waiting for it
  // to land before revealing the card (an earlier approach) meant briefly
  // showing the OLD card's content at the new position, which is invisible
  // when the two cards are identical but very visible when they differ.
  //
  // Since we already have the target SavedCard's full data in memory the
  // instant a swipe completes, there's no need to wait on that round-trip at
  // all: swipeOverride lets the swipe set languageCode/selectedAllergens (and
  // the rest of the card's state) synchronously and instantly, with the
  // storage write + navigate happening in the background purely for
  // persistence/deep-linking. It's cleared once the real props catch up to
  // match it, which is a no-op by then since the content already agrees.
  const [swipeOverride, setSwipeOverride] = useState<{ languageCode: string; ids: string[] } | null>(null);
  const languageCode = swipeOverride?.languageCode ?? languageCodeProp;
  const selectedAllergens = swipeOverride?.ids ?? selectedAllergensProp;

  useEffect(() => {
    if (!swipeOverride) return;
    const sortedProp = [...selectedAllergensProp].sort();
    const sortedOverride = [...swipeOverride.ids].sort();
    const matches = languageCodeProp === swipeOverride.languageCode &&
      sortedProp.length === sortedOverride.length &&
      sortedProp.every((id, i) => id === sortedOverride[i]);
    if (matches) setSwipeOverride(null);
  }, [languageCodeProp, selectedAllergensProp, swipeOverride]);

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

  // If the displayed card isn't part of the saved stack, the first swipe
  // lands on the nearest end of the stack instead of an arbitrary card.
  const prevCard = useMemo(() => {
    if (savedCards.length < 2) return null;
    const idx = currentCardIndex === -1 ? savedCards.length - 1 : currentCardIndex - 1;
    return idx >= 0 && idx < savedCards.length ? savedCards[idx] : null;
  }, [savedCards, currentCardIndex]);

  const nextCard = useMemo(() => {
    if (savedCards.length < 2) return null;
    const idx = currentCardIndex === -1 ? 0 : currentCardIndex + 1;
    return idx >= 0 && idx < savedCards.length ? savedCards[idx] : null;
  }, [savedCards, currentCardIndex]);

  const [emergencyCard, setEmergencyCard] = useState<SavedCard | null>(null);

  useEffect(() => {
    const loadEmergencyCard = async () => {
      const card = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      setEmergencyCard(card);
    };
    loadEmergencyCard();

    window.addEventListener('storage-update', loadEmergencyCard);
    return () => window.removeEventListener('storage-update', loadEmergencyCard);
  }, []);

  const hasEmergencyForLang = !!emergencyCard && emergencyCard.languageCode === languageCode;
  const canSwipe = !!(prevCard || nextCard || hasEmergencyForLang);

  // Measures the visible card area so the drag/peek math below can work in
  // real pixels (how far to drag before a card is fully off-screen, how far
  // off-screen a peeking neighbour starts). A callback ref (rather than
  // useRef + useLayoutEffect) is needed because this element doesn't exist
  // on the very first render whenever the card is still translating (it
  // renders a loading screen instead) - a effect with an empty deps array
  // would only ever see that first, element-less render and never re-measure
  // once the real content mounts.
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const swipeAreaRef = useCallback((el: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (!el) return;
    const updateSize = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    resizeObserverRef.current = observer;
  }, []);

  // Drives both the active card and the peeking neighbours from the same
  // values, so a neighbour slides fully into place exactly as the active
  // card slides fully out - the same technique behind the homepage's
  // vertical card carousel, just driven by hand instead of embla.
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const prevPeekY = useTransform(dragY, (v) => v - containerSize.height);
  const nextPeekY = useTransform(dragY, (v) => v + containerSize.height);
  const emergencyPeekX = useTransform(dragX, (v) => v + containerSize.width);

  // The target SavedCard already carries everything needed to display it -
  // translatedContent, customMessages, selectedAllergens - so the reveal
  // doesn't need to wait on anything async. swipeOverride updates
  // languageCode/selectedAllergens (see above) and these calls update the
  // rest of the displayed state, all synchronously in one batch, so the
  // card that becomes visible when dragY resets is correct from the very
  // first frame. switchToCard/goToEmergencyCard still run in the background
  // to persist the choice and update the URL, but nothing visible depends on
  // them finishing.
  const applyCardData = (card: SavedCard) => {
    setSwipeOverride({ languageCode: card.languageCode, ids: [...card.selectedAllergens.ids] });
    setTranslatedUIText(card.translatedContent.ui);
    setTranslatedAllergens(card.translatedContent.allergens);
    setEmergencyTranslations(card.translatedContent.emergency);
    setCustomMessages(card.customMessages);
    setFullSelectedData(card.selectedAllergens);
    setCustomAllergenTranslations(card.selectedAllergens.custom || {});
    setShowOriginal(false);
  };

  const completeVerticalSwipe = (card: SavedCard, direction: 1 | -1) => {
    animate(dragY, direction === 1 ? -containerSize.height : containerSize.height, SWIPE_SLIDE_TWEEN).then(() => {
      applyCardData(card);
      dragY.set(0);
      switchToCard(card);
    });
  };

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

  const goToEmergencyCard = async (card: SavedCard) => {
    // Switching to the dedicated emergency card overwrites these keys with
    // its data (so the emergency page shows the right thing) - which would
    // otherwise permanently lose track of whatever card was actually active,
    // so swiping back from the emergency page could land on the wrong one.
    // This snapshot lets that swipe-back restore exactly what was showing.
    if (fullSelectedData) {
      await storage.setEphemeral(STORAGE_KEYS.PRE_EMERGENCY_SWIPE_SNAPSHOT, {
        languageCode,
        selectedAllergens: fullSelectedData,
        customMessages,
        translatedContent: currentTranslatedContent
      });
    }

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

    navigate(`/emergency/${card.languageCode}`);
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
    const horizontalDominant = Math.abs(info.offset.x) > Math.abs(info.offset.y);

    if (horizontalDominant) {
      const crossedLeft = info.offset.x <= -SWIPE_DISTANCE_THRESHOLD || info.velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      if (crossedLeft && hasEmergencyForLang && emergencyCard && containerSize.width) {
        const card = emergencyCard;
        animate(dragX, -containerSize.width, SWIPE_SLIDE_TWEEN).then(() => goToEmergencyCard(card));
        return;
      }
      animate(dragX, 0, SWIPE_BOUNCE_SPRING);
      return;
    }

    const crossedUp = info.offset.y <= -SWIPE_DISTANCE_THRESHOLD || info.velocity.y <= -SWIPE_VELOCITY_THRESHOLD;
    const crossedDown = info.offset.y >= SWIPE_DISTANCE_THRESHOLD || info.velocity.y >= SWIPE_VELOCITY_THRESHOLD;

    if (crossedUp && nextCard && containerSize.height) {
      completeVerticalSwipe(nextCard, 1);
      return;
    }
    if (crossedDown && prevCard && containerSize.height) {
      completeVerticalSwipe(prevCard, -1);
      return;
    }
    animate(dragY, 0, SWIPE_BOUNCE_SPRING);
  };

  const withTapGuard = (action: () => void) => () => {
    if (dragMovedRef.current) return;
    action();
  };

  const getPeekAllergensWithImages = (card: SavedCard) =>
    card.selectedAllergens.ids
      .map(id => {
        const predefined = ALLERGEN_OPTIONS.find(option => option.id === id);
        if (predefined) return predefined;
        const customImage = customAllergenImages[id];
        return customImage ? { id, name: id, image: customImage } : null;
      })
      .filter(Boolean) as typeof ALLERGEN_OPTIONS;

  // Non-interactive preview of a neighbouring saved card, built entirely
  // from its own stored translatedContent - no live translation needed, so
  // it can render instantly as soon as it starts peeking in. This mirrors
  // the real card's markup line-for-line (including the custom message
  // lines and footer, which are easy to forget) - any gap between the two
  // shows up as a visible jump (text popping in, the image resizing) the
  // instant the peek is swapped for the real, now-active card.
  const renderCardPeek = (card: SavedCard) => {
    const pills = card.selectedAllergens.ids.map(id => card.translatedContent?.allergens?.[id] || id);
    const previewAllergens = getPeekAllergensWithImages(card);
    const gridStyle = getAllergenGridStyle(previewAllergens.length);
    const ui = card.translatedContent?.ui;
    return (
      <div className="w-full h-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white select-none">
        <div className="h-6 sm:h-10 md:h-14" />
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-8 md:mb-12 text-red-600 uppercase tracking-tighter break-words">
          {ui?.allergyAlert || 'ALLERGY ALERT!'}
        </h1>

        {ui?.iAmAllergicTo && (
          <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-4 sm:mb-8 md:mb-12">
            {ui.iAmAllergicTo}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-8 md:mb-12">
          {pills.map((allergen, i) => (
            <span
              key={i}
              className="bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-base sm:text-lg md:text-xl font-normal uppercase"
            >
              {allergen}
            </span>
          ))}
        </div>

        {ui?.theyMakeMeSick && (
          <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-2 sm:mb-3 leading-tight max-w-2xl">
            {ui.theyMakeMeSick}
          </p>
        )}

        <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-600 italic mb-4 sm:mb-6">
          {ui?.thankYou || 'Thank you!'}
        </p>

        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
          <div className="relative h-full max-h-[400px] w-auto max-w-full aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              {previewAllergens.length > 0 ? (
                <div className="absolute inset-0 grid gap-1 sm:gap-2 items-center justify-items-center z-0 p-4" style={gridStyle}>
                  {previewAllergens.map((allergen) => (
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
              <img src="/noentry.png" alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain z-10 opacity-90 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {card.languageCode !== 'en' && (
            <p className="text-[14px] sm:text-[32px] text-gray-400 font-light mb-1">
              Translated to {getLanguageName(card.languageCode)}
            </p>
          )}
          {!isPremium && (
            <p className="text-[13px] sm:text-base text-gray-400 font-light">
              created with Simple Allergy Alert © 2026
            </p>
          )}
        </div>
      </div>
    );
  };

  // Non-interactive preview of the emergency card for the horizontal
  // swipe-left peek. Mirrors EmergencyPage's real markup line-for-line
  // (needHelp/callServices lines, the CALL button, the footer) - any gap
  // between the two is a visible jump the instant the swipe lands on the
  // real page.
  const renderEmergencyPeek = (card: SavedCard) => {
    const emergency = card.translatedContent?.emergency;
    const dialText = emergency?.dial112?.replace(/\d+/g, '').trim() || 'CALL';
    const emergencyNumber = verifiedEmergencyNumber || getEmergencyNumber(card.languageCode);
    return (
      <div className="w-full h-full flex flex-col items-center justify-start text-center overflow-hidden p-4 sm:p-6 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] bg-white select-none">
        <div className="h-4 sm:h-10 md:h-14 shrink-0" />
        <div className="bg-white border-4 border-black p-3 sm:p-6 rounded-full shadow-lg mb-4 sm:mb-10 shrink-0">
          <EmergencyCrossIcon className="h-8 w-8 sm:h-16 sm:w-16" />
        </div>
        <div className="w-full max-w-2xl flex-1 min-h-0 flex flex-col shrink">
          <div className="border-b-4 border-red-600 pb-2 sm:pb-4 mb-3 sm:mb-10 shrink-0">
            <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-red-600">
              {emergency?.attention || 'ATTENTION'}
            </h1>
          </div>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-start overflow-hidden">
            <div className="w-full space-y-[0.5em]">
              <p className="text-[2rem] sm:text-[4.5rem] font-bold text-gray-900 leading-tight break-words">
                {emergency?.emergency || 'I am having a severe allergic reaction.'}
              </p>
              <p className="text-[2rem] sm:text-[4.5rem] font-bold text-gray-900 leading-tight break-words">
                {emergency?.needHelp || 'I need medical help immediately.'}
              </p>
              <p className="text-[2rem] sm:text-[4.5rem] font-bold text-red-700 leading-tight break-words">
                {emergency?.callServices || 'Please call emergency services.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-auto w-full max-w-md pt-4 shrink-0">
          <div className="flex items-center justify-center w-full py-2.5 sm:py-6 px-6 bg-red-700 text-white rounded-2xl font-black shadow-xl text-center overflow-hidden">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Phone className="h-8 w-8 sm:h-14 sm:w-14 fill-current shrink-0" />
              <span className="text-[2.5rem] sm:text-[3.75rem] leading-tight whitespace-nowrap">{dialText} {emergencyNumber}</span>
            </div>
          </div>
          {card.languageCode !== 'en' && (
            <p className="text-[14px] sm:text-[32px] text-gray-400 font-light mt-2">
              Translated to {getLanguageName(card.languageCode)}
            </p>
          )}
        </div>
      </div>
    );
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
    // While swipeOverride is active, applyCardData has already set this
    // state directly from the known-correct target card - re-reading
    // storage here could win a race against switchToCard's still-in-flight
    // writes (especially on native, where that's a real bridge call) and
    // clobber it with the previous card's data. Once the override clears
    // this runs normally again as a final, by-then-consistent sync.
    if (!swipeOverride) loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, [languageCode, selectedAllergens, swipeOverride]);

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
    // Same reasoning as the loadData effect above: applyCardData already set
    // the translated text/pills directly for a swipe-driven change, so skip
    // the (possibly stale, if switchToCard's writes haven't landed yet)
    // re-derivation until the override clears.
    if (!swipeOverride) translateAllContent();
  }, [translateAllContent, swipeOverride]);

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
    // This is the "view my own emergency info" path (uses the current
    // card's own data, doesn't touch storage) rather than the swipe-to-
    // dedicated-emergency-card path - any snapshot left over from an
    // earlier swipe is now stale and must not be used if the user later
    // swipes back from wherever this leads.
    storage.removeEphemeral(STORAGE_KEYS.PRE_EMERGENCY_SWIPE_SNAPSHOT);
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
      <div ref={swipeAreaRef} className="relative flex-1 min-h-0 w-full overflow-hidden">
        {prevCard && (
          <motion.div className="absolute inset-0 z-10" style={{ y: prevPeekY }} aria-hidden="true">
            {renderCardPeek(prevCard)}
          </motion.div>
        )}
        {nextCard && (
          <motion.div className="absolute inset-0 z-10" style={{ y: nextPeekY }} aria-hidden="true">
            {renderCardPeek(nextCard)}
          </motion.div>
        )}
        {hasEmergencyForLang && emergencyCard && (
          <motion.div className="absolute inset-0 z-10" style={{ x: emergencyPeekX }} aria-hidden="true">
            {renderEmergencyPeek(emergencyCard)}
          </motion.div>
        )}
        <motion.div
          className="absolute inset-0 z-20 w-full h-full flex flex-col bg-white"
          style={{ x: dragX, y: dragY }}
          drag={canSwipe}
          dragDirectionLock
          dragConstraints={{
            top: nextCard ? -containerSize.height : 0,
            bottom: prevCard ? containerSize.height : 0,
            left: hasEmergencyForLang ? -containerSize.width : 0,
            right: 0
          }}
          dragElastic={0.15}
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
      </div>
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