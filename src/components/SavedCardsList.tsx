import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard } from '@/lib/types';

interface SavedCard {
  id: string;
  name: string;
  selectedAllergens: {
    standard: string[];
    custom: string[];
    ids: string[];
  };
  customMessages: {
    iAmAllergicTo: string;
    theyMakeMeSick: string;
  };
  languageCode: string;
  createdAt: string;
  translatedContent?: {
    ui: {
      allergyAlert: string;
      iAmAllergicTo: string;
      pleaseBeCareful: string;
      thankYou: string;
      theyMakeMeSick: string;
    };
    allergens: { [key: string]: string };
    emergency: {
      attention: string;
      emergency: string;
      needHelp: string;
      callServices: string;
      dial112: string;
    };
  };
}

// ... rest of the file uses these properties