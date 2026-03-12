"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, AlertTriangle } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<SavedCard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadCards = async () => {
    const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    
    const combined = emergencyCard ? [emergencyCard, ...standardCards] : standardCards;
    setAllCards(combined);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  const handleDelete = async (e: React.MouseEvent, card: SavedCard) => {
    e.stopPropagation();
    if (card.id === 'emergency-slot') {
      await storage.remove(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      toast.success("Emergency card deleted.");
    } else {
      const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      const updated = standardCards.filter(c => c.id !== card.id);
      await storage.set(STORAGE_KEYS.SAVED_CARDS, updated);
      toast.success(`Card "${card.name}" deleted.`);
    }
    
    // Reload list
    await loadCards();
    
    // Dispatch custom event to notify Home page to expand if no cards left
    window.dispatchEvent(new CustomEvent('storage-update'));
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
    }
    
    if (card.id === 'emergency-slot') {
      navigate(`/emergency/${card.languageCode}`);
    } else {
      navigate(`/alert/${card.languageCode}`);
    }
  };

  if (allCards.length === 0) return null;

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
      <div className="flex items-center justify-between px-8 mb-2">
        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Saved Cards</h3>
        <div className="flex gap-1.5">
          {allCards.map((_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === activeIndex ? "w-4 bg-red-500" : "w-1.5 bg-gray-300 dark:bg-gray-700")} />
          ))}
        </div>
      </div>
      <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {allCards.map((card) => (
          <div key={card.id} className="flex-shrink-0 w-full flex justify-center px-6 snap-center snap-always">
            <Card onClick={() => handleLoad(card)} className={cn("w-full max-w-[320px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden rounded-xl", card.id === 'emergency-slot' && "border-red-200 dark:border-red-900/50")}>
              <CardContent className="p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-medium uppercase", card.id === 'emergency-slot' ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400")}>
                    {card.id === 'emergency-slot' ? `Emergency (${card.languageCode})` : card.languageCode}
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, card)} className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="text-center">
                  <h4 className="text-lg text-gray-800 dark:text-gray-100 line-clamp-1 flex items-center justify-center gap-2">
                    {card.id === 'emergency-slot' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {card.name}
                  </h4>
                  <div className="flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
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