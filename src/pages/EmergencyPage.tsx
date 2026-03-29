"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import FixedHeader from '@/components/FixedHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Phone } from 'lucide-react';
import { getEmergencyNumber } from '@/lib/emergencyNumbers';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const [emergencyCard, setEmergencyCard] = useState<SavedCard | null>(null);

  useEffect(() => {
    const loadEmergencyData = async () => {
      const card = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      if (card) {
        setEmergencyCard(card);
      }
    };
    loadEmergencyData();
  }, []);

  const emergencyNumber = getEmergencyNumber(langCode);

  return (
    <div className="flex flex-col min-h-screen bg-red-50 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+20px)] pb-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-4 border-red-600 animate-pulse-slow">
          <h2 className="text-4xl font-black text-red-600 text-center mb-6">EMERGENCY</h2>
          
          <div className="space-y-6 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              I am having a severe allergic reaction.
            </p>
            
            <div className="py-4 border-y border-red-100 dark:border-gray-700">
              <p className="text-xl text-gray-600 dark:text-gray-400">Please call emergency services:</p>
              <a 
                href={`tel:${emergencyNumber}`} 
                className="text-5xl font-black text-red-600 flex items-center justify-center mt-2 gap-3"
              >
                <Phone className="w-10 h-10 fill-current" />
                {emergencyNumber}
              </a>
            </div>

            {emergencyCard && (
              <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <p className="text-sm font-bold text-gray-400 uppercase mb-2">My Allergens:</p>
                <div className="flex flex-wrap gap-2">
                  {emergencyCard.selectedAllergens.ids.map(id => (
                    <span key={id} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;