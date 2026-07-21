"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Clock, AlertTriangle, Shield } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { computeContentSignature } from '@/lib/customMessages';
import { useBilling } from '@/hooks/useBilling';
import { getLanguageName } from '@/lib/supportedLanguages';
import BackupRestoreDialog from '@/components/BackupRestoreDialog';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [allCards, setAllCards] = useState<SavedCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    axis: 'y'
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
    // Free users can save 1 standard card; premium unlocks multiple.
    // The emergency card is always free and always shown alongside them.
    const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
    const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);

    const combined = emergencyCard ? [emergencyCard, ...standardCards] : standardCards;
    setAllCards(combined);
  };

  useEffect(() => {
    loadCards();

    const handleStorageUpdate = () => loadCards();
    window.addEventListener('storage-update', handleStorageUpdate);
    return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, [isPremium]);

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
      <div className="w-full max-w-[280px] mx-auto mb-1 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">
          Your Cards
        </h3>
        <button
          onClick={() => setShowBackupDialog(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-wider"
        >
          <Shield className="w-3 h-3" />
          Backup
        </button>
      </div>

      <BackupRestoreDialog isOpen={showBackupDialog} onClose={() => setShowBackupDialog(false)} />

      <div className="w-full flex items-center justify-center">
        <div className="relative w-full max-w-[280px]">
        <div className="h-[110px] overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex flex-col h-full">
            {allCards.map((card) => (
              <div key={card.id} className="flex-[0_0_100%] min-h-0 flex justify-center">
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
                        "px-1.5 py-0.5 rounded-md text-[12px] font-bold uppercase tracking-wider",
                        card.id === 'emergency-slot' ? "bg-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      )}>
                        {card.id === 'emergency-slot' ? `${getLanguageName(card.languageCode)}` : getLanguageName(card.languageCode)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, card)}
                        className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center py-0.5">
                      <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1 flex items-center justify-center gap-1.5">
                        {card.id === 'emergency-slot' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                        {card.name}
                      </h4>
                      <div className="flex items-center justify-center text-[12px] text-gray-500 dark:text-gray-400">
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

        <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          {allCards.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                i === selectedIndex ? "h-3 bg-red-600" : "h-1 bg-gray-300 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SavedCardsList;