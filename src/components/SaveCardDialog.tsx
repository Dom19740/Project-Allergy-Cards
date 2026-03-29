"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedCard, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [cardName, setCardName] = useState(isEmergency ? 'Emergency Card' : '');
  const [existingCards, setExistingCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false
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

  useEffect(() => {
    if (isOpen && !isEmergency) {
      const loadCards = async () => {
        const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
        setExistingCards(savedCards);
      };
      loadCards();
    }
  }, [isOpen, isEmergency]);

  const handleSave = async () => {
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
        if (savedCards.length >= 3) {
          toast.error("You can only save up to 3 cards. Please select one to overwrite.");
          return;
        }
        updatedCards = [...savedCards, newCard];
        toast.success(`Card "${cardName}" saved successfully!`);
      }
      
      await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
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
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-6 fixed left-1/2 -translate-x-1/2 top-[calc(1.5rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-2 overflow-hidden px-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-xs font-bold text-gray-400 px-1">
              {selectedCardId ? 'Update Card Name' : 'Card Name'}
            </Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
              className="w-full rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4"
            />
          </div>

          {!isEmergency && existingCards.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <Label className="text-xs font-bold text-gray-400">
                  Or Overwrite Existing
                </Label>
                {existingCards.length > 1 && (
                  <div className="flex justify-end gap-1.5">
                    {existingCards.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300", 
                          i === selectedIndex ? "w-4 bg-red-600" : "w-1.5 bg-gray-300 dark:bg-gray-700"
                        )} 
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                <div className="flex">
                  {existingCards.map((card) => (
                    <div key={card.id} className="flex-[0_0_100%] min-w-0 flex justify-center px-1">
                      <button
                        onClick={() => toggleCardSelection(card)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                          selectedCardId === card.id 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        )}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{card.name}</span>
                          <span className="text-[10px] opacity-60">
                            {new Date(card.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedCardId === card.id && <Check size={16} className="shrink-0 ml-2" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-3 mt-6 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            {selectedCardId ? 'Update Card' : 'Save Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;