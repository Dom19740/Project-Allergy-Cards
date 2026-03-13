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

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<SavedCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Initialize Embla Carousel with drag support and snapping
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false
  });

  // Update the active dot indicator when the slide changes
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
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
    
    const combined = emergencyCard ? [emergencyCard, ...standardCards] : standardCards;
    setAllCards(combined);
  };

  useEffect(() => {
    loadCards();
  }, []);

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
    
    await loadCards();
    // Notify other components that storage has changed
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
    <div className="w-full flex flex-col items-start">
      {/* Header with Title and Dots aligned in a row */}
      <div className="w-full mb-4 px-8 flex flex-row items-center justify-between">
        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Saved Cards
        </h3>
        
        {/* Dot Indicators moved to the top right */}
        <div className="flex justify-end gap-1.5">
          {allCards.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300", 
                i === selectedIndex ? "w-4 bg-red-600" : "w-1.5 bg-gray-300 dark:bg-gray-700"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Carousel Viewport */}
      <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex">
          {allCards.map((card) => (
            <div key={card.id} className="flex-[0_0_100%] min-w-0 flex justify-center px-4">
              <Card 
                onClick={() => handleLoad(card)} 
                className={cn(
                  "w-full max-w-[300px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden rounded-2xl", 
                  card.id === 'emergency-slot' && "border-red-200 dark:border-red-900/50"
                )}
              >
                <CardContent className="p-3 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <div className={cn(
                      "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider", 
                      card.id === 'emergency-slot' ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}>
                      {card.id === 'emergency-slot' ? `Emergency (${card.languageCode})` : card.languageCode}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleDelete(e, card)} 
                      className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-center py-1">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1 flex items-center justify-center gap-2">
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
    </div>
  );
};

export default SavedCardsList;