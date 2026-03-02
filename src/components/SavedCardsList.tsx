"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ExternalLink, Clock } from 'lucide-react';
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
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-center">
        Your Saved Cards ({savedCards.length}/3)
      </h3>
      <div className="grid gap-4">
        {savedCards.map((card) => (
          <Card key={card.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {card.name}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(card.createdAt).toLocaleDateString()} • {card.languageCode.toUpperCase()}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoad(card)}
                  className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
                  title="Load Card"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(card.id, card.name)}
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
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