"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isEmergency = false
}) => {
  const [cardName, setCardName] = useState(isEmergency ? 'Emergency Card' : '');

  const handleSave = async () => {
    const newCard: SavedCard = {
      id: crypto.randomUUID(),
      name: cardName,
      selectedAllergens,
      customMessages,
      languageCode,
      createdAt: new Date().toISOString()
    };

    const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
    await storage.set(STORAGE_KEYS.SAVED_CARDS, [...cards, newCard]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Card</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input 
            value={cardName} 
            onChange={(e) => setCardName(e.target.value)} 
            placeholder="Card Name"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCardDialog;