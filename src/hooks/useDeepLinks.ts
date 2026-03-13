import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';
import { toast } from 'sonner';

export const useDeepLinks = () => {
  const navigate = useNavigate();

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
            // Await all storage operations to ensure they are ready for the next page
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
            navigate(`/alert/${card.languageCode}`);
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
            navigate(`/emergency/${emergencyCard.languageCode}`);
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