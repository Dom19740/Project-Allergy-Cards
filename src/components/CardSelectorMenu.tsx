"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// How close to the scrollable list's top/bottom edge (in px) the pointer
// needs to be, while dragging a card, before the list starts auto-scrolling.
const AUTOSCROLL_EDGE_ZONE = 40;
// Fastest auto-scroll speed (px per animation frame), reached right at the edge.
const AUTOSCROLL_MAX_SPEED = 10;

const CardSelectorMenu: React.FC<CardSelectorMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const cardsRef = useRef<SavedCard[]>([]);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragInfoRef = useRef<{ id: string; originalIndex: number; itemHeight: number; startY: number } | null>(null);
  // While dragging near the top/bottom edge of the (possibly taller-than-
  // viewport) list, the list scrolls itself - scrolledAmountRef tracks how
  // far that auto-scroll has moved the content, so the drag's own position
  // math (based on raw pointer delta) can account for it. Without this the
  // dragged row would drift away from the pointer as soon as the list
  // started scrolling.
  const scrolledAmountRef = useRef(0);
  const pointerYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);

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

  // Which saved card matches the currently displayed one, so it can be
  // highlighted in the list - same id-less matching AllergyCard uses, since
  // the active card's data lives in loose storage keys, not a SavedCard id.
  const [activeSelection, setActiveSelection] = useState<{ ids: string[]; languageCode: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadActiveSelection = async () => {
      const [selected, lang] = await Promise.all([
        storage.get<{ ids?: string[] }>(STORAGE_KEYS.SELECTED_ALLERGENS),
        storage.get<string>(STORAGE_KEYS.SELECTED_LANGUAGE)
      ]);
      setActiveSelection({ ids: selected?.ids || [], languageCode: lang || '' });
    };
    loadActiveSelection();
  }, [isOpen]);

  const activeCardId = useMemo(() => {
    if (!activeSelection) return null;
    const sortedSelected = [...activeSelection.ids].sort();
    const match = cards.find(card => {
      if (card.languageCode !== activeSelection.languageCode) return false;
      const cardIds = [...(card.selectedAllergens?.ids || [])].sort();
      return cardIds.length === sortedSelected.length && cardIds.every((id, i) => id === sortedSelected[i]);
    });
    return match?.id ?? null;
  }, [cards, activeSelection]);

  // Recomputes the dragged row's visual offset and reorders the list if it's
  // crossed a neighbour, using the latest pointer position plus whatever the
  // auto-scroll loop has moved the list by. Called both from pointermove and
  // from the auto-scroll frame loop (since scrolling itself changes the
  // dragged row's position relative to the pointer, even with no new
  // pointermove event).
  const updateDragPosition = () => {
    const info = dragInfoRef.current;
    const y = pointerYRef.current;
    if (!info || y === null) return;

    const delta = (y - info.startY) + scrolledAmountRef.current;
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
  };

  const stopAutoScroll = () => {
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  };

  const autoScrollTick = () => {
    const container = listRef.current;
    const y = pointerYRef.current;
    if (!container || y === null || !dragInfoRef.current) {
      autoScrollFrameRef.current = null;
      return;
    }

    const rect = container.getBoundingClientRect();
    let speed = 0;
    if (y < rect.top + AUTOSCROLL_EDGE_ZONE) {
      const proximity = Math.min(1, (rect.top + AUTOSCROLL_EDGE_ZONE - y) / AUTOSCROLL_EDGE_ZONE);
      speed = -AUTOSCROLL_MAX_SPEED * proximity;
    } else if (y > rect.bottom - AUTOSCROLL_EDGE_ZONE) {
      const proximity = Math.min(1, (y - (rect.bottom - AUTOSCROLL_EDGE_ZONE)) / AUTOSCROLL_EDGE_ZONE);
      speed = AUTOSCROLL_MAX_SPEED * proximity;
    }

    if (speed !== 0) {
      const before = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = Math.max(0, Math.min(maxScroll, before + speed));
      const actualDelta = container.scrollTop - before;
      if (actualDelta !== 0) {
        scrolledAmountRef.current += actualDelta;
        updateDragPosition();
      }
    }

    autoScrollFrameRef.current = requestAnimationFrame(autoScrollTick);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragInfoRef.current) return;
    pointerYRef.current = e.clientY;
    updateDragPosition();
    if (autoScrollFrameRef.current === null) {
      autoScrollFrameRef.current = requestAnimationFrame(autoScrollTick);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    stopAutoScroll();
    dragInfoRef.current = null;
    pointerYRef.current = null;
    setDragState(null);
    storage.set(STORAGE_KEYS.SAVED_CARDS, cardsRef.current);
  }, [handlePointerMove]);

  // Dragging is scoped to the grip handle only, so the rest of the row
  // (the name/button) stays a normal, natively-scrollable, non-draggable
  // area - text can't get selected by accident because there's no text
  // under the handle at all, and the list itself scrolls normally since
  // touch-action is only restricted on the handle, not the whole row.
  const handleDragStart = (e: React.PointerEvent, card: SavedCard) => {
    e.preventDefault();
    const index = cardsRef.current.findIndex(c => c.id === card.id);
    if (index === -1) return;
    const el = itemRefs.current.get(card.id);
    const itemHeight = el?.getBoundingClientRect().height ?? 44;
    scrolledAmountRef.current = 0;
    pointerYRef.current = e.clientY;
    dragInfoRef.current = { id: card.id, originalIndex: index, itemHeight, startY: e.clientY };
    setDragState({ id: card.id, offset: 0 });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    return () => {
      stopAutoScroll();
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

            <div ref={listRef} className="max-h-64 overflow-y-auto space-y-1">
              {cards.map((card) => {
                const isDragging = dragState?.id === card.id;
                const isActive = card.id === activeCardId;
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
                      "w-full flex items-center gap-1 pl-2 pr-1 py-0.5 border-2 transition-colors rounded-xl",
                      isActive ? "border-red-500" : "border-gray-200 dark:border-gray-700",
                      isDragging ? "bg-gray-100 dark:bg-gray-700 shadow-lg" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <button
                      onClick={() => handleSelect(card)}
                      className="flex-1 min-w-0 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      <span className="truncate block">{card.name} ({shortLangCode})</span>
                    </button>
                    <div
                      onPointerDown={(e) => handleDragStart(e, card)}
                      className="shrink-0 flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-grab active:cursor-grabbing touch-none select-none"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
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
