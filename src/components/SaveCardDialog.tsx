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
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] rounded-[32px] border-none shadow-2xl bg-white dark:bg-gray-900 top-[35%] translate-y-[-35%] p-8 mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Card Name
            </Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
              className="h-12 rounded-2xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="h-12 rounded-2xl font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
          >
            Save Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;