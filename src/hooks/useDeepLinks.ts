"use client";

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';

export const useDeepLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleDeepLink = async (event: URLOpenListenerEvent) => {
      const urlStr = event.url;
      try {
        const url = new URL(urlStr);
        const host = url.host;
        const path = url.pathname;

        if (host === 'card') {
          const cardId = path.replace('/', '');
          const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
          const card = savedCards.find(c => c.id === cardId);

          if (card) {
            await Promise.all([
              storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens),
              storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages),
              storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode)
            ]);

            if (card.translatedContent) {
              await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
                languageCode: card.languageCode,
                content: card.translatedContent
              });
            }
            
            // Force navigation with fromWidget state
            const targetPath = `/alert/${card.languageCode}`;
            navigate(targetPath, { replace: true, state: { fromWidget: true, refresh: Date.now() } });
          }
        } else if (host === 'emergency') {
          const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
          if (emergencyCard) {
            await Promise.all([
              storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, emergencyCard.selectedAllergens),
              storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, emergencyCard.customMessages),
              storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, emergencyCard.languageCode)
            ]);

            if (emergencyCard.translatedContent) {
              await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
                languageCode: emergencyCard.languageCode,
                content: emergencyCard.translatedContent
              });
            }
            navigate(`/emergency/${emergencyCard.languageCode}`, { replace: true, state: { fromWidget: true, refresh: Date.now() } });
          } else {
            navigate('/');
            setTimeout(() => {
              toast.error("Emergency card not saved. Please create and save one first.");
            }, 500);
          }
        }
      } catch (e) {
        console.error('Failed to parse deep link', e);
      }
    };

    const setupListener = async () => {
      await App.addListener('appUrlOpen', handleDeepLink);
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl) handleDeepLink(launchUrl);
    };

    setupListener();
    return () => { App.removeAllListeners(); };
  }, [navigate]);
};