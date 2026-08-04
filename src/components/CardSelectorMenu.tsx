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

const CardSelectorMenu: React.FC<CardSelectorMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const cardsRef = useRef<SavedCard[]>([]);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragInfoRef = useRef<{ id: string; originalIndex: number; itemHeight: number; startY: number } | null>(null);
  // The whole row is the drag handle (not just the grip icon) so a
  // press-and-drag anywhere on it reorders the card instead of Android
  // occasionally falling into text selection. Since the row also has to stay
  // tappable to select the card, dragMovedRef distinguishes a real drag from
  // a tap: it only flips once the pointer moves past TAP_TOLERANCE, and both
  // the reorder logic and the tap's onClick check it before acting.
  const dragMovedRef = useRef(false);
  const TAP_TOLERANCE = 8;

  // Dragging only engages after a long press. Reordering and scrolling the
  // list both start as a vertical drag on the same rows, so without this a
  // normal scroll attempt gets grabbed as a reorder instead - the row stays
  // scrollable (touch-action: pan-y) until the hold completes, and only
  // switches into drag mode if the pointer hasn't moved and hasn't lifted by
  // then. A real move or release before that just cancels the pending timer.
  const LONG_PRESS_MS = 400;
  const MOVE_CANCEL_TOLERANCE = 10;
  const longPressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef<{ x: number; y: number; card: SavedCard; pointerId: number; target: Element } | null>(null);

  const clearPendingLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressStartRef.current = null;
  };

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

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const info = dragInfoRef.current;
    if (!info) return;
    const delta = e.clientY - info.startY;
    if (!dragMovedRef.current && Math.abs(delta) > TAP_TOLERANCE) {
      dragMovedRef.current = true;
    }
    if (!dragMovedRef.current) return;

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
    if (dragMovedRef.current) {
      storage.set(STORAGE_KEYS.SAVED_CARDS, cardsRef.current);
    }
  }, [handlePointerMove]);

  // The whole row (not just the grip icon) is the drag handle once engaged,
  // so there's a much bigger, easier-to-hit target on mobile than the grip
  // alone. Whether it turns into a reorder or a tap-to-select is decided by
  // movement, in handlePointerMove/the button's onClick below.
  const engageDrag = (card: SavedCard, startY: number) => {
    const index = cardsRef.current.findIndex(c => c.id === card.id);
    if (index === -1) return;
    const el = itemRefs.current.get(card.id);
    const itemHeight = el?.getBoundingClientRect().height ?? 56;
    dragInfoRef.current = { id: card.id, originalIndex: index, itemHeight, startY };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRowPointerDown = (e: React.PointerEvent, card: SavedCard) => {
    dragMovedRef.current = false;
    clearPendingLongPress();
    const { clientX, clientY, pointerId, currentTarget } = e;
    pressStartRef.current = { x: clientX, y: clientY, card, pointerId, target: currentTarget };
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      const pending = pressStartRef.current;
      if (!pending) return;
      pressStartRef.current = null;
      try {
        (pending.target as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(pending.pointerId);
      } catch {
        // Pointer may already be gone (finger lifted right at the boundary) - fine to ignore.
      }
      engageDrag(pending.card, pending.y);
    }, LONG_PRESS_MS);
  };

  const handleRowPointerMove = (e: React.PointerEvent) => {
    const pending = pressStartRef.current;
    if (!pending) return;
    const dx = e.clientX - pending.x;
    const dy = e.clientY - pending.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_TOLERANCE) {
      // Real movement before the hold completed - this is a scroll attempt,
      // not a long press, so let the native scroll (touch-pan-y) carry on.
      clearPendingLongPress();
    }
  };

  const handleRowPointerEnd = () => {
    clearPendingLongPress();
  };

  useEffect(() => {
    return () => {
      clearPendingLongPress();
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

            <div className="max-h-64 overflow-y-auto space-y-1.5">
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
                    onPointerDown={(e) => handleRowPointerDown(e, card)}
                    onPointerMove={handleRowPointerMove}
                    onPointerUp={handleRowPointerEnd}
                    onPointerCancel={handleRowPointerEnd}
                    className={cn(
                      "w-full flex items-center space-x-2 px-2 py-2 border-2 transition-colors select-none cursor-grab active:cursor-grabbing",
                      isDragging ? "touch-none" : "touch-pan-y",
                      isActive ? "rounded-xl border-red-500" : "rounded-xl border-gray-200 dark:border-gray-700",
                      isDragging ? "bg-gray-100 dark:bg-gray-700 shadow-lg" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="shrink-0 text-gray-400 pointer-events-none">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <button
                      onClick={() => { if (!dragMovedRef.current) handleSelect(card); }}
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
