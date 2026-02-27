"use client";

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageCode, translations, languageOptions, getAllergyMessage } from '@/lib/translations';
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

  const text = translations[languageCode];
  const englishLanguageName = languageOptions.find(lang => lang.code === languageCode)?.name || translations[languageCode].languageName;

  const { title, body } = getAllergyMessage(languageCode, selectedAllergens);

  const allergensWithImages = selectedAllergens
    .map(id => ALLERGEN_OPTIONS.find(option => option.id === id))
    .filter(Boolean) as typeof ALLERGEN_OPTIONS;

  let imageGridClasses = "";
  let rowClasses = "";
  if (allergensWithImages.length === 1) {
    imageGridClasses = "grid grid-cols-1";
  } else if (allergensWithImages.length >= 2 && allergensWithImages.length <= 4) {
    imageGridClasses = "grid grid-cols-2";
    rowClasses = allergensWithImages.length <= 2 ? "" : "grid-rows-2 [&>*:nth-child(-n+2)]:self-end [&>*:nth-child(n+3)]:self-start";
  } else if (allergensWithImages.length >= 5) {
    imageGridClasses = "grid grid-cols-3";
    rowClasses = allergensWithImages.length <= 3 ? "" : 
                 allergensWithImages.length <= 6 ? "grid-rows-2 [&>*:nth-child(-n+3)]:self-end [&>*:nth-child(n+4)]:self-start" :
                 "grid-rows-3 [&>*:nth-child(-n+3)]:self-end [&>*:nth-child(n+7)]:self-start";
  }

  const handleShare = async () => {
    if (!cardRef.current) {
      toast.error("Could not capture card. Please try again.");
      return;
    }

    setIsSharing(true);
    const loadingToastId = toast.loading("Preparing your allergy card for sharing...");

    try {
      // Temporarily hide the footer links before capturing
      const footerLinks = cardRef.current.querySelectorAll('.footer-link');
      footerLinks.forEach(link => (link as HTMLElement).style.visibility = 'hidden');

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // Ensure white background for the card
        scale: 2, // Increase scale for better resolution
      });

      // Restore visibility of footer links
      footerLinks.forEach(link => (link as HTMLElement).style.visibility = 'visible');

      const image = canvas.toDataURL('image/png');
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], 'allergy-card.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Allergy Alert Card',
          text: 'Please be aware of my allergies!',
        });
        toast.success("Allergy card shared successfully!", { id: loadingToastId });
      } else {
        // Fallback for browsers that don't support Web Share API or file sharing
        const link = document.createElement('a');
        link.href = image;
        link.download = 'allergy-card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Allergy card downloaded successfully!", { id: loadingToastId });
      }
    } catch (error) {
      console.error("Error sharing allergy card:", error);
      toast.error("Failed to share allergy card. Please try again.", { id: loadingToastId });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div 
      ref={cardRef} 
      className="flex flex-col items-center justify-between w-full bg-white text-foreground p-3 sm:p-6 text-center relative overflow-hidden h-[100dvh]"
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-3">
        {title}
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug">
        {body.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < body.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      
      <p className="text-base sm:text-lg md:text-xl font-medium mt-3 mb-2">
        {text.thankYou}
      </p>

      {allergensWithImages.length > 0 && (
        <div className="relative w-full h-full flex-1 min-h-0">
          <div className={`absolute inset-0 ${imageGridClasses} ${rowClasses} gap-1 p-4`}>
            {allergensWithImages.map((allergen) => (
              <div key={allergen.id} className="w-full h-full flex items-center justify-center">
                <img 
                  src={allergen.image} 
                  alt={allergen.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
            ))}
          </div>
          <img 
            src="/noentry.png" 
            alt="No entry" 
            className="absolute inset-0 w-full h-full object-contain z-10" 
          />
        </div>
      )}

      <Button 
        onClick={handleShare} 
        disabled={isSharing}
        className="mt-4 bg-green-600 text-white hover:bg-green-700 w-8 h-8 flex items-center justify-center"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
        <Link to="/select-allergens" className="footer-link text-sm sm:text-base font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
          Select Allergen
        </Link>
        <Link to="/select-language" className="footer-link text-sm sm:text-base font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
          {englishLanguageName}
        </Link>
      </div>
    </div>
  );
};

export default AllergyCard;