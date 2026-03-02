"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SavedCard, SelectedAllergens, CustomMessages, TranslatedContent } from '@/lib/types';

interface SaveCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: string;
  selectedAllergens: SelectedAllergens;
  customMessages: CustomMessages;
  translatedContent: TranslatedContent;
}

const SaveCardDialog: React.FC<SaveCardDialogProps> = ({
  isOpen,
  onClose,
  languageCode,
  selectedAllergens,
  customMessages,
  translatedContent
}) => {
  const [cardName, setCardName] = useState('');

  const handleSave = () => {
    if (!cardName.trim()) {
      toast.error("Please enter a name for your card.");
      return;
    }

    const storedCards = localStorage.getItem('savedAllergyCards');
    let savedCards: SavedCard[] = [];
    
    if (storedCards) {
      try {
        savedCards = JSON.parse(storedCards);
      } catch (e) {
        console.error("Failed to parse saved cards", e);
      }
    }

    if (savedCards.length >= 3) {
      toast.error("You can only save up to 3 cards. Please delete one to save a new one.");
      return;
    }

    const newCard: SavedCard = {
      id: crypto.randomUUID(),
      name: cardName.trim(),
      languageCode,
      selectedAllergens,
      customMessages,
      translatedContent,
      createdAt: Date.now()
    };

    const updatedCards = [...savedCards, newCard];
    localStorage.setItem('savedAllergyCards', JSON.stringify(updatedCards));
    
    toast.success(`Card "${cardName}" saved successfully!`);
    setCardName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Allergy Card</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. My Thai Card"
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