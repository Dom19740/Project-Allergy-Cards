"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Download, Loader2, Edit, Save, Menu } from 'lucide-react';
import { LanguageCode, SelectedAllergens, CustomMessages } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText } from '@/lib/translator';
import SaveCardDialog from './SaveCardDialog';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [customAllergenTranslations, setCustomAllergenTranslations] = useState<{ [key: string]: { [lang: string]: string } }>({});
  const [translatedAllergens, setTranslatedAllergens] = useState<{ [key: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [fullSelectedData, setFullSelectedData] = useState<SelectedAllergens | null>(null);
  const [customMessages, setCustomMessages] = useState<CustomMessages>({
    iAmAllergicTo: "I can not eat:",
    theyMakeMeSick: "They make me very sick and I could die"
  });
  const [translatedUIText, setTranslatedUIText] = useState({
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: "I can not eat:",
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you!",
    languageName: "English",
    theyMakeMeSick: "They make me very sick and I could die"
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load custom allergen translations and alert messages from localStorage
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        setFullSelectedData(parsed);
        const custom = parsed.custom || {};
        setCustomAllergenTranslations(custom);
      } catch (e) {
        console.error("Failed to parse stored allergens", e);
      }
    }

    const savedAlert = localStorage.getItem('customAlertMessages');
    if (savedAlert) {
      try {
        const parsed = JSON.parse(savedAlert);
        setCustomMessages({
          iAmAllergicTo: parsed.iAmAllergicTo || "I can not eat:",
          theyMakeMeSick: parsed.theyMakeMeSick || "They make me very sick and I could die"
        });
      } catch (e) {
        console.error("Failed to parse custom alert messages", e);
      }
    }
  }, []);

  // Translate all text when language code changes or custom messages change
  useEffect(() => {
    const translateAllContent = async () => {
      if (!languageCode || languageCode === 'en') {
        setTranslatedUIText({
          allergyAlert: "ALLERGY ALERT!",
          iAmAllergicTo: customMessages.iAmAllergicTo,
          pleaseBeCareful: "Please be careful with my food.",
          thankYou: "Thank you!",
          languageName: "English",
          theyMakeMeSick: customMessages.theyMakeMeSick
        });

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
        const [alert, allergicTo, careful, thankYou, langName, theyMakeMeSick] = await Promise.all([
          translateText("ALLERGY ALERT!", languageCode),
          translateText(customMessages.iAmAllergicTo, languageCode),
          translateText("Please be careful with my food.", languageCode),
          translateText("Thank you!", languageCode),
          translateText("English", languageCode),
          translateText(customMessages.theyMakeMeSick, languageCode)
        ]);

        setTranslatedUIText({
          allergyAlert: alert,
          iAmAllergicTo: allergicTo,
          pleaseBeCareful: careful,
          thankYou: thankYou,
          languageName: langName,
          theyMakeMeSick: theyMakeMeSick
        });

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
        toast.error("Translation failed. Please try again.");
      } finally {
        setIsTranslating(false);
      }
    };

    translateAllContent();
  }, [languageCode, selectedAllergens, customMessages]);

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

  const handleShare = async () => {
    if (cardRef.current) {
      setIsSharing(true);
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `allergy-card-${languageCode}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Allergy Card',
            text: 'Check out my allergy card!'
          });
          toast.success("Allergy card shared successfully!");
        } else {
          toast.warning("Web Share API not supported. Please download the card instead.");
          handleDownload();
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing image:', error);
          toast.error("Failed to share card. Please try again.");
        }
      } finally {
        setIsSharing(false);
      }
    }
  };

  const translatedAllergenList = selectedAllergens.map(allergen => 
    translatedAllergens[allergen] || allergen
  );

  const allergensWithImages = selectedAllergens
    .map(id => ALLERGEN_OPTIONS.find(option => option.id === id))
    .filter(Boolean) as typeof ALLERGEN_OPTIONS;

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
    <div className="flex flex-col items-center justify-around w-full bg-white text-foreground p-4 sm:p-8 text-center relative overflow-hidden pb-20 flex-grow">
      <div ref={cardRef} className="flex flex-col items-center justify-center w-full h-full bg-white p-4 relative">
        <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-8 text-red-600 dark:text-red-400">
          {translatedUIText.allergyAlert}
        </h1>

        <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300 mb-4">
          {translatedUIText.iAmAllergicTo}
        </p>

        <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-4">
          {translatedAllergenList.map((allergen, index) => (
            <span
              key={index}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold"
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
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="bg-green-600 text-white hover:bg-green-700 w-8 h-8 p-0 rounded flex items-center justify-center"
        >
          {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        </Button>
        <Button
          onClick={() => setIsSaveDialogOpen(true)}
          className="bg-red-600 text-white hover:bg-red-700 w-8 h-8 p-0 rounded flex items-center justify-center"
          title="Save Card"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-blue-600 text-white hover:bg-blue-700 w-8 h-8 p-0 rounded flex items-center justify-center"
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
        <Button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-gray-400/80 hover:bg-gray-500 text-white w-8 h-8 p-0 rounded flex items-center justify-center"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {isMenuOpen && (
          <div className="absolute left-1/2 top-[-60px] transform -translate-x-1/2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
            <Link
              to="/"
              className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/");
              }}
            >
              Home
            </Link>
            <Link
              to="/select-allergens"
              className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/select-allergens");
              }}
            >
              Allergen
            </Link>
            <Link
              to="/select-alert"
              className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/select-alert");
              }}
            >
              Alert
            </Link>
            <Link
              to="/select-language"
              className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/select-language");
              }}
            >
              Language
            </Link>
          </div>
        )}
      </div>
      {fullSelectedData && (
        <SaveCardDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={languageCode}
          selectedAllergens={fullSelectedData}
          customMessages={customMessages}
        />
      )}
    </div>
  );
};

export default AllergyCard;