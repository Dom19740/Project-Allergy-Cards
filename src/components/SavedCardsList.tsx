"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock, ChevronRight } from 'lucide-react';
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

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const updatedCards = savedCards.filter(card => card.id !== id);
    await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
    setSavedCards(updatedCards);
    toast.success(`Card "${name}" deleted.`);
  };

  const handleLoad = async (card: SavedCard) => {
    await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens);
    await storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages);
    await storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode);
    
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
    <div className="w-full mt-6 mb-4">
      <div className="flex items-center justify-between px-6 mb-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Saved Cards ({savedCards.length}/3)
        </h3>
        {savedCards.length > 1 && (
          <div className="flex items-center text-xs text-gray-400 animate-pulse">
            <span>Scroll</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </div>
      
      <div className="flex overflow-x-auto pb-4 px-4 gap-4 snap-x no-scrollbar">
        {savedCards.map((card) => (
          <Card 
            key={card.id} 
            onClick={() => handleLoad(card)}
            className="flex-shrink-0 w-[260px] snap-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden rounded-2xl"
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                  {card.languageCode}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(e, card.id, card.name)}
                  className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                  {card.name}
                </h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Open Card
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Spacer for better scrolling at the end */}
        <div className="flex-shrink-0 w-2" />
      </div>
    </div>
  );
};

export default SavedCardsList;