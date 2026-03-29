import { useParams } from 'react-router-dom';
import AllergyCard from '@/components/AllergyCard';
import { LanguageCode, translations } from '@/lib/translations';
import NotFound from './NotFound';

const AllergyAlertPage = () => {
  const { langCode } = useParams<{ langCode: string }>();

  if (!langCode || !(langCode in translations)) {
    return <NotFound />;
  }

  // Retrieve selected allergens from local storage
  const storedAllergens = localStorage.getItem('selectedAllergens');
  const selectedAllergens: string[] = storedAllergens ? JSON.parse(storedAllergens) : [];

  // Retrieve initialTranslations from storage or compute it
  const initialTranslations = {}; // This should be implemented based on your logic

  return (
    <div className="flex flex-col items-center min-h-screen bg-white dark:bg-white">
      <AllergyCard
        languageCode={langCode as LanguageCode}
        selectedAllergens={selectedAllergens}
        initialTranslations={initialTranslations}
      />
    </div>
  );
};

export default AllergyAlertPage;