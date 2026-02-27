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
  if (allergensWithImages.length === 1) {
    imageGridClasses = "grid grid-cols-1";
  } else if (allergensWithImages.length >= 2 && allergensWithImages.length <= 4) {
    imageGridClasses = "grid grid-cols-2";
  } else if (allergensWithImages.length >= 5) {
    imageGridClasses = "grid grid-cols-3";
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
      className="flex flex-col items-center justify-around w-full bg-white text-foreground p-4 sm:p-8 text-center relative overflow-hidden pb-20 flex-grow"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-8">
        {title}
      </h1>
      <p className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-relaxed">
        {body.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < body.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      
      <p className="text-xl sm:text-2xl md:text-3xl font-medium mt-8 mb-4">
        {text.thankYou}
      </p>

      {allergensWithImages.length > 0 && (
        <div className="relative w-full max-w-md aspect-square mx-auto my-4">
          <div className={`absolute inset-0 ${imageGridClasses} gap-1 p-1 items-center justify-center`}>
            {allergensWithImages.map((allergen) => (
              <div key={allergen.id} className="aspect-square flex items-center justify-center">
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
            className="absolute inset-0 w-full h-full object-contain z-10"
          />
        </div>
      )}

      <Button 
        onClick={handleShare} 
        disabled={isSharing}
        className="mt-8 bg-green-600 text-white hover:bg-green-700 w-12 h-12 flex items-center justify-center"
      >
        <Share2 className="h-5 w-5" />
      </Button>

      <Link to="/select-allergens" className="footer-link absolute bottom-4 left-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        Select Allergen
      </Link>

      <Link to="/select-language" className="footer-link absolute bottom-4 right-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        {englishLanguageName}
      </Link>
    </div>
  );
};

export default AllergyCard;