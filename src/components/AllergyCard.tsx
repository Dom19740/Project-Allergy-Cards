"use client";

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { LanguageCode, SelectedAllergens, CustomMessages } from '@/lib/types';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText } from '@/lib/translator';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens }) => {
  const cardRef = useRef<HTMLDivElement>(null);
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
        toast.error("Translation failed. Please try again.", { duration: 1000 });
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
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `allergy-card-${languageCode}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Allergy card downloaded!", { duration: 1000 });
      } catch (error) {
        console.error('Error downloading image:', error);
        toast.error("Failed to download card.", { duration: 1000 });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleShare = async () => {
    if (cardRef.current) {
      setIsSharing(true);
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `allergy-card-${languageCode}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Allergy Card',
            text: 'Check out my allergy card!'
          });
        } else {
          toast.warning("Sharing not supported on this browser. Downloading instead.", { duration: 1000 });
          handleDownload();
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing image:', error);
          toast.error("Failed to share card.", { duration: 1000 });
        }
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handlePrint = () => {
    if (cardRef.current) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Allergy Card</title>');
        printWindow.document.write('<link rel="stylesheet" href="/src/globals.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(cardRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
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
    imageGridClasses = "grid-cols-1 grid-rows-1";
  } else if (allergensWithImages.length === 2) {
    imageGridClasses = "grid-cols-2 grid-rows-1";
  } else if (allergensWithImages.length <= 4) {
    imageGridClasses = "grid-cols-2 grid-rows-2";
  } else if (allergensWithImages.length <= 6) {
    imageGridClasses = "grid-cols-3 grid-rows-2";
  } else {
    imageGridClasses = "grid-cols-3 grid-rows-3";
  }

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-lg sm:text-xl md:text-2xl font-normal text-gray-700">Translating your card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white overflow-hidden">
      {/* Printable Area */}
      <div 
        ref={cardRef} 
        className="flex-1 w-full flex flex-col items-center justify-start text-center print:shadow-none print:m-0 print:rounded-none overflow-hidden p-4 sm:p-6 md:p-8 bg-white"
      >
        <div className="h-4 sm:h-8 md:h-12" />

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-8 md:mb-12 text-red-600 uppercase tracking-tighter whitespace-nowrap">
          {translatedUIText.allergyAlert}
        </h1>

        <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-4 sm:mb-8 md:mb-12">
          {translatedUIText.iAmAllergicTo}
        </p>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
          {translatedAllergenList.map((allergen, index) => (
            <span
              key={index}
              className="bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-base sm:text-lg md:text-xl font-normal uppercase"
            >
              {allergen}
            </span>
          ))}
        </div>

        <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-800 mb-2 sm:mb-3 leading-tight max-w-2xl">
          {translatedUIText.theyMakeMeSick}
        </p>

        <p className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-600 italic mb-4 sm:mb-6">
          {translatedUIText.thankYou}
        </p>

        {allergensWithImages.length > 0 && (
          <div className="relative w-full max-w-[400px] aspect-square mx-auto flex-shrink min-h-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`absolute inset-0 grid ${imageGridClasses} gap-1 sm:gap-2 items-center justify-items-center z-0 p-4`}>
                {allergensWithImages.map((allergen) => (
                  <div key={allergen.id} className="w-full h-full flex items-center justify-center">
                    <img
                      src={allergen.image}
                      alt={allergen.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              
              <img
                src="/noentry.png"
                alt="No entry"
                className="absolute inset-0 w-full h-full object-contain z-10 opacity-90 pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <CardActions 
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSave={() => setIsSaveDialogOpen(true)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        isSharing={isSharing}
        isDownloading={isDownloading}
      />

      {/* Navigation Menu */}
      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />

      {/* Save Dialog */}
      {fullSelectedData && (
        <SaveCardDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={languageCode}
          selectedAllergens={fullSelectedData}
          customMessages={customMessages}
        />
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
        }
      `}} />
    </div>
  );
};

export default AllergyCard;