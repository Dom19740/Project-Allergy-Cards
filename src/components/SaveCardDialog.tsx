"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedCard, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

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

  const handleSave = async () => {
    if (!cardName.trim()) {
      toast.error("Please enter a name for your card.");
      return;
    }

    const newCard: SavedCard = {
      id: isEmergency ? 'emergency-slot' : crypto.randomUUID(),
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
      if (savedCards.length >= 3) {
        toast.error("You can only save up to 3 cards. Please delete one to save a new one.");
        return;
      }
      const updatedCards = [...savedCards, newCard];
      await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
      toast.success(`Card "${cardName}" saved successfully!`);
    }
    
    setCardName('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-6 top-[15%] sm:top-[50%] translate-y-0 sm:-translate-y-1/2 animate-in fade-in slide-in-from-bottom-8 duration-300"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Card Name
            </Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
              className="rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 mt-6 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            Save Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;