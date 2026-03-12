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
  isEmergency?: boolean; // New prop to identify emergency card saving
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEmergency ? 'Save Emergency Card' : 'Save Allergy Card'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEmergency ? "Emergency Card" : "e.g. My Thai Card"}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">Save Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;