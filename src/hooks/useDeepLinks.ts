"use client";

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';

export const useDeepLinks = () => {
  const navigate = useNavigate();
  const launchUrlProcessed = useRef(false);

  useEffect(() => {
    const handleDeepLink = async (urlStr: string) => {
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
            
            // Navigate with a fresh timestamp in state to ensure component refresh
            navigate(`/alert/${card.languageCode}`, { 
              replace: true,
              state: { refresh: Date.now() }
            });
          }
        } else if (host === 'emergency') {
          const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
          if (emergencyCard) {
            await Promise.all([
              storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, emergencyCard.selectedAllergens),
              storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, emergencyCard.customMessages),
              storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, emergencyCard.languageCode)
            ]);
            navigate(`/emergency/${emergencyCard.languageCode}`, { 
              replace: true,
              state: { refresh: Date.now() }
            });
          } else {
            navigate('/');
          }
        }
      } catch (e) {
        console.error('Deep link processing error', e);
      }
    };

    const setupListeners = async () => {
      const listener = await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        handleDeepLink(event.url);
      });

      if (!launchUrlProcessed.current) {
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl) {
          handleDeepLink(launchUrl.url);
          launchUrlProcessed.current = true;
        }
      }

      return listener;
    };

    let appListener: any;
    setupListeners().then(l => { appListener = l; });

    return () => {
      if (appListener) appListener.remove();
    };
  }, [navigate]);
};