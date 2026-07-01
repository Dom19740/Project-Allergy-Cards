"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, AlertTriangle } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { computeContentSignature } from '@/lib/customMessages';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<SavedCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const loadCards = async () => {
    const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
    const emergencyCard = await storage.getEphemeral<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    
    const combined = emergencyCard ? [emergencyCard, ...standardCards] : standardCards;
    setAllCards(combined);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleDelete = async (e: React.MouseEvent, card: SavedCard) => {
    e.stopPropagation();
    if (card.id === 'emergency-slot') {
      await storage.removeEphemeral(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      toast.success("Emergency card deleted.");
    } else {
      const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      const updated = standardCards.filter(c => c.id !== card.id);
      await storage.set(STORAGE_KEYS.SAVED_CARDS, updated);
      toast.success(`Card "${card.name}" deleted.`);
    }
    
    await loadCards();
    window.dispatchEvent(new CustomEvent('storage-update'));
  };

  const handleLoad = async (card: SavedCard) => {
    await Promise.all([
      storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens),
      storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages),
      storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode)
    ]);
    
    if (card.translatedContent) {
      await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
        languageCode: card.languageCode,
        signature: computeContentSignature(card.customMessages, card.selectedAllergens.ids),
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
    <div className="w-full flex flex-col items-start mt-1">
      <div className="w-full mb-1 px-8 flex flex-row items-center justify-between">
        <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          Saved Cards
        </h3>
        
        <div className="flex justify-end gap-1.5">
          {allCards.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300", 
                i === selectedIndex ? "w-3 bg-red-600" : "w-1 bg-gray-300 dark:bg-gray-700"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex">
          {allCards.map((card) => (
            <div key={card.id} className="flex-[0_0_100%] min-w-0 flex justify-center px-4">
              <Card 
                onClick={() => handleLoad(card)} 
                className={cn(
                  "w-full max-w-[280px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer overflow-hidden rounded-xl", 
                  card.id === 'emergency-slot' && "border-red-200 dark:border-red-900/50"
                )}
              >
                <CardContent className="p-2 flex flex-col">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className={cn(
                      "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider", 
                      card.id === 'emergency-slot' ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}>
                      {card.id === 'emergency-slot' ? `Emergency (${card.languageCode})` : card.languageCode}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleDelete(e, card)} 
                      className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-center py-0.5">
                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1 flex items-center justify-center gap-1.5">
                      {card.id === 'emergency-slot' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                      {card.name}
                    </h4>
                    <div className="flex items-center justify-center text-[9px] text-gray-500 dark:text-gray-400">
                      <Clock className="w-2.5 h-2.5 mr-1" />
                      {new Date(card.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedCardsList;