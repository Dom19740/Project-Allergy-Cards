"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical, X } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { computeContentSignature } from '@/lib/customMessages';
import { cn } from '@/lib/utils';

interface CardSelectorMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DragState {
  id: string;
  offset: number;
}

const CardSelectorMenu: React.FC<CardSelectorMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const cardsRef = useRef<SavedCard[]>([]);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragInfoRef = useRef<{ id: string; originalIndex: number; itemHeight: number; startY: number } | null>(null);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    if (!isOpen) return;
    const loadCards = async () => {
      const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      setCards(standardCards);
    };
    loadCards();
  }, [isOpen]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const info = dragInfoRef.current;
    if (!info) return;
    const delta = e.clientY - info.startY;
    const rawIndex = info.originalIndex + Math.round(delta / info.itemHeight);
    const maxIndex = cardsRef.current.length - 1;
    const targetIndex = Math.max(0, Math.min(maxIndex, rawIndex));
    const offset = delta - (targetIndex - info.originalIndex) * info.itemHeight;
    setDragState({ id: info.id, offset });

    const currentIndex = cardsRef.current.findIndex(c => c.id === info.id);
    if (currentIndex !== -1 && currentIndex !== targetIndex) {
      const updated = [...cardsRef.current];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      setCards(updated);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    dragInfoRef.current = null;
    setDragState(null);
    storage.set(STORAGE_KEYS.SAVED_CARDS, cardsRef.current);
  }, [handlePointerMove]);

  const handleDragStart = (e: React.PointerEvent, card: SavedCard) => {
    e.preventDefault();
    const index = cardsRef.current.findIndex(c => c.id === card.id);
    if (index === -1) return;
    const el = itemRefs.current.get(card.id);
    const itemHeight = el?.getBoundingClientRect().height ?? 56;
    dragInfoRef.current = { id: card.id, originalIndex: index, itemHeight, startY: e.clientY };
    setDragState({ id: card.id, offset: 0 });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  if (!isOpen) return null;

  const handleSelect = async (card: SavedCard) => {
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

    onClose();
    navigate(`/alert/${card.languageCode}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Centering Container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-full duration-500 ease-out">
          <div className="p-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Cards</span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {cards.map((card) => {
                const isDragging = dragState?.id === card.id;
                const shortLangCode = card.languageCode.split('-')[0].toUpperCase();
                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(card.id, el);
                      else itemRefs.current.delete(card.id);
                    }}
                    style={dragState && dragState.id === card.id ? {
                      transform: `translateY(${dragState.offset}px)`,
                      position: 'relative',
                      zIndex: 10
                    } : undefined}
                    className={cn(
                      "w-full flex items-center space-x-2 px-2 py-3 rounded-xl transition-colors",
                      isDragging ? "bg-gray-100 dark:bg-gray-700 shadow-lg" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <div
                      onPointerDown={(e) => handleDragStart(e, card)}
                      className="shrink-0 p-2 -m-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <button
                      onClick={() => handleSelect(card)}
                      className="flex-1 min-w-0 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      <span className="truncate block">{card.name} ({shortLangCode})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardSelectorMenu;
