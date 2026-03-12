"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
      if (cards) {
        setSavedCards(cards);
      }
    };
    loadCards();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const updatedCards = savedCards.filter(card => card.id !== id);
    await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
    setSavedCards(updatedCards);
    toast.success(`Card "${name}" deleted.`);
  };

  const handleLoad = async (card: SavedCard) => {
    // Set the current session data to match the saved card
    await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens);
    await storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages);
    await storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode);
    
    // Store the translated content for this session to enable offline use
    if (card.translatedContent) {
      await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
        languageCode: card.languageCode,
        content: card.translatedContent
      });
    } else {
      await storage.remove(STORAGE_KEYS.SESSION_TRANSLATIONS);
    }
    
    navigate(`/alert/${card.languageCode}`);
    toast.success(`Loaded card: ${card.name}`);
  };

  if (savedCards.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 mb-8 p-6 bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-md">
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">
          Your Saved Cards ({savedCards.length}/3)
        </h3>
      </div>
      
      <div className="grid gap-4">
        {savedCards.map((card) => (
          <Card key={card.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col flex-1 pr-4 text-left">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {card.name}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(card.createdAt).toLocaleDateString()} • {card.languageCode.toUpperCase()}
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoad(card)}
                  className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-900/50"
                  title="Load Card"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(card.id, card.name)}
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/50"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedCardsList;