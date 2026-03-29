"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);

  const loadCards = async () => {
    const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
    setCards(savedCards || []);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleDelete = async (id: string) => {
    const updatedCards = cards.filter(c => c.id !== id);
    await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
    setCards(updatedCards);
    toast.success("Card deleted");
    window.dispatchEvent(new Event('storage-update'));
  };

  if (cards.length === 0) return null;

  return (
    <div className="w-full px-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider text-left ml-2">Your Saved Cards</h3>
      {cards.map((card) => (
        <div key={card.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
          <div className="flex flex-col text-left">
            <span className="font-bold text-gray-800 dark:text-gray-100">{card.name}</span>
            <span className="text-xs text-gray-500 uppercase">{card.languageCode}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/alert/${card.languageCode}`)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDelete(card.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedCardsList;