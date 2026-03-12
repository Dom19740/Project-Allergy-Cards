import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';

export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDeepLink = async (event: URLOpenListenerEvent) => {
      // URL format: simpleallergyalert://card/:id or simpleallergyalert://emergency
      const urlStr = event.url;
      console.log('Deep link received:', urlStr);

      try {
        const url = new URL(urlStr);
        const host = url.host;
        const path = url.pathname;

        if (host === 'card') {
          const cardId = path.replace('/', '');
          const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
          const card = savedCards.find(c => c.id === cardId);

          if (card) {
            await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, card.selectedAllergens);
            await storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, card.customMessages);
            await storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, card.languageCode);
            
            if (card.translatedContent) {
              await storage.set(STORAGE_KEYS.SESSION_TRANSLATIONS, {
                languageCode: card.languageCode,
                content: card.translatedContent
              });
            }
            
            navigate(`/alert/${card.languageCode}`);
          }
        } else if (host === 'emergency') {
          const lastLang = await storage.get<string>(STORAGE_KEYS.LAST_EMERGENCY_LANG) || 'en';
          navigate(`/emergency/${lastLang}`);
        }
      } catch (e) {
        console.error('Failed to parse deep link', e);
      }
    };

    const setupListener = async () => {
      await App.addListener('appUrlOpen', handleDeepLink);

      const launchUrl = await App.getLaunchUrl();
      if (launchUrl) {
        handleDeepLink(launchUrl);
      }
    };

    setupListener();

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};
