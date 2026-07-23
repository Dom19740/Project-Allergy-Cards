"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, X } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { computeContentSignature } from '@/lib/customMessages';

interface CardSelectorMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CardSelectorMenu: React.FC<CardSelectorMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const loadCards = async () => {
      const standardCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      setCards(standardCards);
    };
    loadCards();
  }, [isOpen]);

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
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelect(card)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                >
                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="truncate">{card.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardSelectorMenu;
