"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCards = async () => {
      const cards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS);
      if (cards) {
        setSavedCards(cards);
      }
    };
    loadCards();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

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
    <div className="w-full">
      <div className="flex items-center justify-between px-8 mb-2">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Saved Cards
        </h3>
        <div className="flex gap-1.5">
          {savedCards.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex ? "w-4 bg-red-500" : "w-1.5 bg-gray-300 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {savedCards.map((card) => (
          <div key={card.id} className="flex-shrink-0 w-full flex justify-center px-6 snap-center">
            <Card 
              onClick={() => handleLoad(card)}
              className="w-full max-w-[320px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer overflow-hidden rounded-2xl"
            >
              <CardContent className="p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                    {card.languageCode}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, card.id, card.name)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">
                    {card.name}
                  </h4>
                  <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Tap to Open
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedCardsList;