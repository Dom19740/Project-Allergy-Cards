import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LanguageCode, translations, getAllergyMessage } from '@/lib/translations';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [translatedUIText, setTranslatedUIText] = useState<{
    allergyAlert: string;
    iAmAllergicTo: string;
    pleaseBeCareful: string;
    thankYou: string;
    theyMakeMeSick: string;
  }>({
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: "I can not eat:",
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you!",
    theyMakeMeSick: "They make me very sick and I could die"
  });

  // Load translations when languageCode or selectedAllergens change
  useEffect(() => {
    let isMounted = true;
    const loadTranslations = async () => {
      if (!isMounted) return;
      const result = await Promise.all([
        translateText(translatedUIText.allergyAlert, languageCode),
        translateText(translatedUIText.iAmAllergicTo, languageCode),
        translateText(translatedUIText.pleaseBeCareful, languageCode),
        translateText(translatedUIText.thankYou, languageCode),
        translateText(translatedUIText.theyMakeMeSick, languageCode)
      ]);
      if (isMounted) {
        setTranslatedUIText({
          allergyAlert: result[0],
          iAmAllergicTo: result[1],
          pleaseBeCareful: result[2],
          thankYou: result[3],
          theyMakeMeSick: result[4]
        });
      }
    };
    loadTranslations();
    return () => { isMounted = false; };
  }, [languageCode, selectedAllergens]);

  // ... rest of component unchanged, now use translatedUIText
  return (
    <div ref={cardRef} className="..."> {/* unchanged */}
      <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-8 text-red-600 dark:text-red-400">
        {translatedUIText.allergyAlert}
      </h1>
      {/* ... */}
    </div>
  );
};

export default AllergyCard;