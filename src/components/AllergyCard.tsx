import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Loader2 } from 'lucide-react';
import { LanguageCode } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText } from '@/lib/translator';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customAllergenTranslations, setCustomAllergenTranslations] = useState<{ [key: string]: { [lang: string]: string } }>({});
  const [translatedAllergens, setTranslatedAllergens] = useState<{ [key: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedUIText, setTranslatedUIText] = useState({
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: "I can not eat:",
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you!",
    languageName: "English",
    theyMakeMeSick: "They make me very sick and I could die"
  });

  // Load custom allergen translations from localStorage
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        const custom = parsed.custom || {};
        setCustomAllergenTranslations(custom);
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
      }
    }
  }, []);

  // Translate all text when language code changes
  useEffect(() => {
    const translateAllContent = async () => {
      if (!languageCode || languageCode === 'en') {
        // For English, use default text
        setTranslatedUIText({
          allergyAlert: "ALLERGY ALERT!",
          iAmAllergicTo: "I can not eat:",
          pleaseBeCareful: "Please be careful with my food.",
          thankYou: "Thank you!",
          languageName: "English",
          theyMakeMeSick: "They make me very sick and I could die"
        });

        // Translate allergen names
        const allergenTranslations: { [key: string]: string } = {};
        for (const allergenId of selectedAllergens) {
          const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
          if (predefinedAllergen) {
            allergenTranslations[allergenId] = predefinedAllergen.name;
          } else {
            allergenTranslations[allergenId] = customAllergenTranslations[allergenId]?.[languageCode] || allergenId;
          }
        }
        setTranslatedAllergens(allergenTranslations);
        return;
      }

      setIsTranslating(true);
      try {
        // Translate UI text
        const [alert, allergicTo, careful, thankYou, langName, theyMakeMeSick] = await Promise.all([
          translateText("ALLERGY ALERT!", languageCode),
          translateText("I can not eat:", languageCode),
          translateText("Please be careful with my food.", languageCode),
          translateText("Thank you!", languageCode),
          translateText("English", languageCode),
          translateText("They make me very sick and I could die", languageCode)
        ]);

        setTranslatedUIText({
          allergyAlert: alert,
          iAmAllergicTo: allergicTo,
          pleaseBeCareful: careful,
          thankYou: thankYou,
          languageName: langName,
          theyMakeMeSick: theyMakeMeSick
        });

        // Translate allergen names
        const allergenTranslations: { [key: string]: string } = {};
        for (const allergenId of selectedAllergens) {
          const predefinedAllergen = ALLERGEN_OPTIONS.find(opt => opt.id === allergenId);
          if (predefinedAllergen) {
            allergenTranslations[allergenId] = await translateText(predefinedAllergen.name, languageCode);
          } else {
            if (customAllergenTranslations[allergenId]?.[languageCode]) {
              allergenTranslations[allergenId] = customAllergenTranslations[allergenId][languageCode];
            } else {
              allergenTranslations[allergenId] = await translateText(allergenId, languageCode);
            }
          }
        }
        setTranslatedAllergens(allergenTranslations);
      } catch (error) {
        console.error('Translation failed:', error);
        toast.error("Translation failed. Using default text.");
      } finally {
        setIsTranslating(false);
      }
    };

    translateAllContent();
  }, [languageCode, selectedAllergens, customAllergenTranslations]);

  const handleDownload = async () => {
    if (cardRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true });
        const link = document.createElement('a');
        link.download = `allergy-card-${languageCode}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Allergy card downloaded!");
      } catch (error) {
        console.error('Error downloading image:', error);
        toast.error("Failed to download card. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Wait for all images inside the card to load before capture
  const waitForImages = (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    const pending = imgs
      .filter(img => !img.complete || (img as HTMLImageElement).naturalWidth === 0)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
      );
    return Promise.all(pending).then(() => undefined);
  };

  const dataUrlToBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const handleShare = async () => {
    if (!cardRef.current) {
      console.error('[Share] cardRef is null.');
      toast.error('Unable to share. Try again.');
      return;
    }

    setIsSharing(true);
    try {
      // Ensure images are loaded before capture
      console.info('[Share] Waiting for images to load...');
      await waitForImages(cardRef.current);
      console.info('[Share] Images loaded. Capturing PNG...');

      // Capture at higher pixel ratio for crisp output
      const pixelRatio = Math.max(2, Math.min(window.devicePixelRatio || 1, 3));
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio });
      console.info('[Share] Image captured. Creating blob and file...');

      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], `allergy-card-${languageCode}.png`, { type: 'image/png' });

      // Step 1: Try Native Share API with file (mobile best experience)
      try {
        const canShareFiles =
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] as any });

        if (canShareFiles && navigator.share) {
          console.info('[Share] Using navigator.share with file...');
          await navigator.share({
            files: [file],
            title: 'My Allergy Card',
            text: 'Check out my allergy card!',
          } as any);
          toast.success('Card shared');
          return;
        } else if (navigator.share) {
          console.info('[Share] Using navigator.share with URL fallback...');
          await navigator.share({
            title: 'My Allergy Card',
            text: 'Check out my allergy card!',
            url: dataUrl,
          } as any);
          toast.success('Card shared');
          return;
        } else {
          console.info('[Share] Native Share API not available.');
        }
      } catch (e) {
        console.warn('[Share] Native share failed:', e);
      }

      // Final fallback: Directly download the image (no clipboard, no new tab)
      try {
        console.info('[Share] Triggering direct download fallback...');
        const link = document.createElement('a');
        link.download = `allergy-card-${languageCode}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Card downloaded');
        return;
      } catch (e) {
        console.error('[Share] Download fallback failed:', e);
        toast.error('Unable to share. Try again.');
      }
    } catch (error) {
      console.error('[Share] Unexpected error:', error);
      toast.error('Unable to share. Try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Create translated allergen list for display
  const translatedAllergenList = selectedAllergens.map(allergen => 
    translatedAllergens[allergen] || allergen
  );

  // Create the title and body using translated text
  const title = translatedUIText.allergyAlert;
  const body = `${translatedUIText.iAmAllergicTo} ${translatedAllergenList.join(', ')}.`;

  // Filter selected allergens to only include those with predefined images
  const allergensWithImages = selectedAllergens
    .map(id => ALLERGEN_OPTIONS.find(option => option.id === id))
    .filter(Boolean) as typeof ALLERGEN_OPTIONS;

  // Determine grid classes based on the number of images
  let imageGridClasses = "";
  if (allergensWithImages.length === 1) {
    imageGridClasses = "grid grid-cols-1";
  } else if (allergensWithImages.length >= 2 && allergensWithImages.length <= 4) {
    imageGridClasses = "grid grid-cols-2";
  } else if (allergensWithImages.length >= 5) {
    imageGridClasses = "grid grid-cols-3";
  }

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-lg text-gray-700">Translating...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="flex flex-col items-center justify-around w-full bg-white text-foreground p-4 sm:p-8 text-center relative overflow-hidden pb-20 flex-grow">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-100 dark:from-red-950 dark:via-gray-900 dark:to-red-950 opacity-75"></div>
      
      <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-8 text-red-600 dark:text-red-400">
        {title}
      </h1>
      
      <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-semibold leading-relaxed text-gray-800 dark:text-gray-200">
        {translatedUIText.iAmAllergicTo}
      </p>
      
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-4">
        {translatedAllergenList.map((allergen, index) => (
          <span
            key={index}
            className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-semibold"
          >
            {allergen}
          </span>
        ))}
      </div>

      <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        {translatedUIText.theyMakeMeSick}
      </p>

      <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-400">
        {translatedUIText.thankYou}
      </p>

      {/* Allergen Images with No Entry Overlay */}
      {allergensWithImages.length > 0 && (
        <div className="relative z-10 w-full max-w-[350px] max-h-[350px] aspect-square mx-auto my-4">
          <div className={`absolute inset-0 ${imageGridClasses} gap-1 p-1`}>
            {allergensWithImages.map((allergen) => (
              <img 
                key={allergen.id}
                src={allergen.image} 
                alt={allergen.name} 
                className="w-full h-full object-contain" 
              />
            ))}
          </div>
          <img 
            src="/noentry.png" 
            alt="No entry" 
            className="absolute inset-0 w-full h-full object-contain z-10"
          />
        </div>
      )}

      <Link to="/select-allergens" className="absolute bottom-4 left-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        Select Allergen
      </Link>

      <Button
        onClick={handleShare}
        disabled={isSharing}
        aria-label="Share card"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white hover:bg-green-700 w-8 h-8 p-0 rounded flex items-center justify-center text-xs font-semibold z-20"
      >
        {isSharing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
      </Button>


      

      <Link to="/select-language" className="absolute bottom-4 right-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        Select Language
      </Link>
    </div>
  );
};

export default AllergyCard;