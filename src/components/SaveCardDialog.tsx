"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedCard, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBilling } from '@/hooks/useBilling';
import { PREMIUM_LIMITS } from '@/lib/premium-config';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

interface SaveCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  translatedContent: TranslatedContent;
  isEmergency?: boolean;
}

const SaveCardDialog: React.FC<SaveCardDialogProps> = ({
  isOpen,
  onClose,
  languageCode,
  selectedAllergens,
  customMessages,
  translatedContent,
  isEmergency = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium } = useBilling();
  const [cardName, setCardName] = useState(isEmergency ? 'Emergency Card' : '');
  const [existingCards, setExistingCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Free users get one saved allergy card; premium unlocks multiple.
  // Overwriting an already-selected card is always allowed - only
  // creating an additional new card requires premium once the free
  // slot is used up. The emergency card is always free.
  const maxSavedCards = isPremium ? PREMIUM_LIMITS.MAX_SAVED_CARDS : PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS;
  const isAtCardLimit = !isEmergency && existingCards.length >= maxSavedCards;
  const isLocked = isAtCardLimit && !selectedCardId;
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    axis: 'y'
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const notifyAtCardLimit = () => {
    // Premium is already the highest tier, so "upgrade" only ever applies to
    // the free-tier message - it has nowhere higher to go.
    toast.error(
      isPremium
        ? `You've saved the maximum of ${maxSavedCards} cards. Delete or overwrite an existing card to save a new one.`
        : `You can save ${maxSavedCards} card for free. Upgrade, delete, or overwrite your existing card to save a new one.`
    );
  };

  useEffect(() => {
    if (isOpen && !isEmergency) {
      const loadCards = async () => {
        const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
        setExistingCards(savedCards);

        // Warn immediately on open if already at the limit, rather than only
        // after the user types a name and taps Save - that way it's obvious
        // up front why the fields look locked, instead of looking broken.
        const limit = isPremium ? PREMIUM_LIMITS.MAX_SAVED_CARDS : PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS;
        if (savedCards.length >= limit) {
          notifyAtCardLimit();
        }
      };
      loadCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEmergency]);

  const handleSave = async () => {
    if (isLocked) {
      notifyAtCardLimit();
      return;
    }

    if (!cardName.trim()) {
      toast.error("Please enter a name for your card.");
      return;
    }

    const newCard: SavedCard = {
      id: isEmergency ? 'emergency-slot' : (selectedCardId || crypto.randomUUID()),
      name: cardName.trim(),
      languageCode,
      selectedAllergens,
      customMessages,
      translatedContent,
      createdAt: Date.now()
    };

    if (isEmergency) {
      await storage.set(STORAGE_KEYS.SAVED_EMERGENCY_CARD, newCard);
      toast.success("Emergency card saved successfully!");
    } else {
      const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      
      let updatedCards: SavedCard[];
      if (selectedCardId) {
        updatedCards = savedCards.map(card => card.id === selectedCardId ? newCard : card);
        toast.success(`Card "${cardName}" updated successfully!`);
      } else {
        if (savedCards.length >= maxSavedCards) {
          notifyAtCardLimit();
          return;
        }
        updatedCards = [...savedCards, newCard];
        toast.success(`Card "${cardName}" saved successfully!`);
      }
      
      await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
    }

    window.dispatchEvent(new CustomEvent('storage-update'));

    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({
        name: 'save_card_success',
        params: {
          is_emergency: isEmergency,
          language: languageCode,
          card_name: cardName.trim()
        }
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setCardName(isEmergency ? 'Emergency Card' : '');
    setSelectedCardId(null);
    setSelectedIndex(0);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleCardSelection = (card: SavedCard) => {
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      setCardName('');
    } else {
      setSelectedCardId(card.id);
      setCardName(card.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-4 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="mb-1">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 px-1 min-w-0">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider">
              {selectedCardId ? 'Update Card Name' : 'Card Name'}
            </Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocked}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
              className="w-full h-10 rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4 disabled:opacity-50"
            />
            {isLocked && !isPremium && (
              <button
                onClick={() => {
                  handleClose();
                  navigate('/premium-onboarding', { state: { premiumReturnTo: location.pathname } });
                }}
                className="mt-1 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
              >
                <Crown className="h-4 w-4" />
                Unlock Multiple Save Cards
              </button>
            )}
          </div>

          {!isEmergency && existingCards.length > 0 && (
            <div className="flex flex-col gap-1 overflow-hidden min-w-0">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                Or Overwrite Existing
              </Label>

              <div className="relative w-full max-w-[260px] mx-auto">
                <div className="h-16 overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                  <div className="flex flex-col h-full">
                    {existingCards.map((card) => (
                      <div key={card.id} className="flex-[0_0_100%] min-h-0 flex justify-center">
                        <button
                          onClick={() => toggleCardSelection(card)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left",
                            selectedCardId === card.id
                              ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              // Overwriting is always a real, clickable option (not a fallback), even
                              // while the card-name field above is locked at the save limit - so it
                              // needs to read as active/interactive, not washed-out like a disabled
                              // control. White background + solid border + full-contrast text instead
                              // of the previous all-gray palette.
                              : 'border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:bg-red-50/50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:border-red-900/50'
                          )}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-sm truncate">
                              {card.name} ({card.languageCode.split('-')[0].toUpperCase()})
                            </span>
                            <span className="text-[10px] opacity-60">
                              Saved {new Date(card.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {selectedCardId === card.id && <Check size={16} className="shrink-0 ml-2" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {existingCards.length > 1 && (
                  <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
                    {existingCards.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all duration-300",
                          i === selectedIndex ? "h-3 bg-red-600" : "h-1 bg-gray-300 dark:bg-gray-700"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 mt-3 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            className="flex-1 h-11 rounded-xl shadow-sm transition-all active:scale-95 font-medium disabled:opacity-50"
          >
            {selectedCardId ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;