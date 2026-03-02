"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock, Bookmark } from 'lucide-react';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';

const SavedCardsList = () => {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    const storedCards = localStorage.getItem('savedAllergyCards');
    if (storedCards) {
      try {
        setSavedCards(JSON.parse(storedCards));
      } catch (e) {
        console.error("Failed to parse saved cards", e);
      }
    }
  }, []);

  const handleDelete = (id: string, name: string) => {
    const updatedCards = savedCards.filter(card => card.id !== id);
    localStorage.setItem('savedAllergyCards', JSON.stringify(updatedCards));
    setSavedCards(updatedCards);
    toast.success(`Card "${name}" deleted.`);
  };

  const handleLoad = (card: SavedCard) => {
    // Set the current session data to match the saved card
    localStorage.setItem('selectedAllergens', JSON.stringify(card.selectedAllergens));
    localStorage.setItem('customAlertMessages', JSON.stringify(card.customMessages));
    localStorage.setItem('selectedLanguageCode', card.languageCode);
    
    navigate(`/alert/${card.languageCode}`);
    toast.success(`Loaded card: ${card.name}`);
  };

  if (savedCards.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 px-4 py-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
      <div className="flex items-center justify-center mb-6 space-x-2">
        <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Your Saved Cards ({savedCards.length}/3)
        </h3>
      </div>
      <div className="grid gap-4">
        {savedCards.map((card) => (
          <Card key={card.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col flex-1 pr-4 text-left">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {card.name}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(card.createdAt).toLocaleDateString()} • {card.languageCode.toUpperCase()}
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoad(card)}
                  className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  title="Load Card"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(card.id, card.name)}
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedCardsList;