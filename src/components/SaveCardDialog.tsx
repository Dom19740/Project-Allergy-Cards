"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedCard, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Check } from 'lucide-react';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isEmergency) {
      const loadCards = async () => {
        const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
        setExistingCards(savedCards);
      };
      loadCards();
    }
  }, [isOpen, isEmergency]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

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
        // Overwrite existing card
        updatedCards = savedCards.map(card => card.id === selectedCardId ? newCard : card);
        toast.success(`Card "${cardName}" updated successfully!`);
      } else {
        // Save as new card
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
    setActiveIndex(0);
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
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-6 top-[15%] sm:top-[50%] translate-y-0 sm:-translate-y-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-2 overflow-hidden">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-xs font-bold text-gray-400">
              {selectedCardId ? 'Update Card Name' : 'Card Name'}
            </Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
              className="w-full rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200"
            />
          </div>

          {!isEmergency && existingCards.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 overflow-hidden">
              <Label className="text-xs font-bold text-gray-400">
                Or Overwrite Existing
              </Label>
              <div className="relative w-full overflow-hidden">
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-1"
                >
                  {existingCards.map((card) => (
                    <div key={card.id} className="flex-none w-full snap-center px-1">
                      <button
                        onClick={() => toggleCardSelection(card)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                          selectedCardId === card.id 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
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
                
                {existingCards.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {existingCards.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeIndex === i ? 'w-4 bg-red-500' : 'w-1.5 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
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