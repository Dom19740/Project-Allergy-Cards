import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageCode, translations, languageOptions, getAllergyMessage } from '@/lib/translations';
import { ALLERGEN_OPTIONS } from '@/lib/allergens'; // Import ALLERGEN_OPTIONS

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[]; // New prop for selected allergens
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens }) => {
  const text = translations[languageCode];
  const englishLanguageName = languageOptions.find(lang => lang.code === languageCode)?.name || translations[languageCode].languageName;

  // Dynamically generate the title and body based on selected allergens
  const { title, body } = getAllergyMessage(languageCode, selectedAllergens);

  // Filter selected allergens to only include those with predefined images
  const allergensWithImages = selectedAllergens
    .map(id => ALLERGEN_OPTIONS.find(option => option.id === id))
    .filter(Boolean) as typeof ALLERGEN_OPTIONS; // Filter out undefined and assert type

  // Determine grid classes based on the number of images
  let imageGridClasses = "";
  if (allergensWithImages.length === 1) {
    imageGridClasses = "grid grid-cols-1";
  } else if (allergensWithImages.length >= 2 && allergensWithImages.length <= 4) {
    imageGridClasses = "grid grid-cols-2";
  } else if (allergensWithImages.length >= 5) {
    imageGridClasses = "grid grid-cols-3"; // Scale down for 5 or more images
  }

  return (
    <div className="flex flex-col items-center justify-around w-full bg-white text-foreground p-4 sm:p-8 text-center relative overflow-hidden pb-20 flex-grow"> {/* Removed h-screen, added flex-grow */}
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
      
      {allergensWithImages.length > 0 && (
        <div className="relative w-full max-w-[90vw] max-h-[35vh] aspect-square mx-auto my-4">
          {/* Allergen images grid */}
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
          {/* No entry overlay */}
          <img 
            src="/noentry.png" 
            alt="No entry" 
            className="absolute inset-0 w-full h-full object-contain z-10" // z-10 to ensure it's on top
          />
        </div>
      )}

      <p className="text-xl sm:text-2xl md:text-3xl font-medium">
        {text.thankYou}
      </p>

      <Link to="/select-allergens" className="absolute bottom-4 left-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        Select Allergen
      </Link>

      <Link to="/select-language" className="absolute bottom-4 right-4 text-sm sm:text-base md:text-lg font-light opacity-80 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
        {englishLanguageName}
      </Link>
    </div>
  );
};

export default AllergyCard;