"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { translateText, getSupportedLanguages } from '@/lib/translator';
import FixedHeader from '@/components/FixedHeader';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedStandardAllergens, setSelectedStandardAllergens] = useState<string[]>([]);
  const [customAllergens, setCustomAllergens] = useState<{ [key: string]: { [lang: string]: string } }>({});
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedTitle, setTranslatedTitle] = useState("Select Allergens");
  const [translatedContinue, setTranslatedContinue] = useState("Continue");
  const [translatedAdd, setTranslatedAdd] = useState("Add");
  const [translatedPlaceholder, setTranslatedPlaceholder] = useState("Add your own allergen");
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [supportedLanguageCodes, setSupportedLanguageCodes] = useState<string[]>([]);

  // Load selected allergens from local storage on mount
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        const standard = parsed.standard || [];
        const custom = parsed.custom || {};
        setSelectedStandardAllergens(standard);
        setCustomAllergens(custom);
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
        localStorage.removeItem('selectedAllergens');
      }
    }
  }, []);

  // Load supported language codes for translating custom allergens
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const langs = await getSupportedLanguages();
        if (!mounted) return;
        setSupportedLanguageCodes(langs.map(l => l.code));
      } catch (e) {
        console.error('Failed to load supported languages', e);
        setSupportedLanguageCodes(['en']);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load current language from localStorage and translate interface
  useEffect(() => {
    const loadLanguageAndTranslate = async () => {
      const storedLang = localStorage.getItem('selectedLanguage') || 'en';
      setCurrentLanguage(storedLang);

      if (storedLang === 'en') {
        setTranslatedTitle("Select Allergens");
        setTranslatedContinue("Continue");
        setTranslatedAdd("Add");
        setTranslatedPlaceholder("Add your own allergen");
        return;
      }

      try {
        const [title, continueBtn, addBtn, placeholder] = await Promise.all([
          translateText("Select Allergens", storedLang),
          translateText("Continue", storedLang),
          translateText("Add", storedLang),
          translateText("Add your own allergen", storedLang),
        ]);

        setTranslatedTitle(title);
        setTranslatedContinue(continueBtn);
        setTranslatedAdd(addBtn);
        setTranslatedPlaceholder(placeholder);
      } catch (error) {
        console.error('Interface translation failed:', error);
      }
    };

    loadLanguageAndTranslate();
  }, []);

  const handleCheckboxChange = (allergenId: string, isChecked: boolean) => {
    setSelectedStandardAllergens(prev => 
      isChecked ? [...prev, allergenId] : prev.filter(id => id !== allergenId)
    );
  };

  const handleAddCustomAllergen = async () => {
    const trimmedInput = customAllergenInput.trim();
    if (!trimmedInput) {
      toast.error("Custom allergen cannot be empty.");
      return;
    }

    const allSelected = [...selectedStandardAllergens, ...Object.keys(customAllergens)];
    if (allSelected.some(allergen => allergen.toLowerCase() === trimmedInput.toLowerCase())) {
      toast.warning("This allergen is already added.");
      return;
    }

    setIsTranslating(true);
    const newCustomAllergens = { ...customAllergens };
    newCustomAllergens[trimmedInput] = { en: trimmedInput }; // Store original as English

    try {
      // Translate for all supported languages
      const langsToUse = supportedLanguageCodes.length ? supportedLanguageCodes : ['en'];
      for (const lang of langsToUse) {
        if (lang === 'en') continue; // Skip English as it's our source
        newCustomAllergens[trimmedInput][lang] = await translateText(trimmedInput, lang);
      }
      setCustomAllergens(newCustomAllergens);
      // Mark custom allergen as selected by default
      setSelectedStandardAllergens(prev => [...prev, trimmedInput]);
      toast.success(`"${trimmedInput}" added and translated.`);
    } catch (error) {
      console.error('Failed to translate custom allergen:', error);
      toast.error("Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
      setCustomAllergenInput('');
    }
  };

  const handleRemoveAllergen = (allergenToRemove: string) => {
    let updatedStandard = [...selectedStandardAllergens];
    let updatedCustom = { ...customAllergens };
    
    const isStandard = ALLERGEN_OPTIONS.some(opt => opt.id === allergenToRemove);

    if (isStandard) {
      updatedStandard = updatedStandard.filter(id => id !== allergenToRemove);
    } else {
      // Remove custom allergen entry and also ensure it's removed from selection
      delete updatedCustom[allergenToRemove];
      updatedStandard = updatedStandard.filter(id => id !== allergenToRemove);
    }
    
    setSelectedStandardAllergens(updatedStandard);
    setCustomAllergens(updatedCustom);
    toast.info(`"${allergenToRemove}" removed.`);
  };

  const handleContinue = () => {
    const allSelected = [...selectedStandardAllergens];
    if (allSelected.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    const dataToStore = { standard: selectedStandardAllergens, custom: customAllergens };
    localStorage.setItem('selectedAllergens', JSON.stringify(dataToStore));
    navigate('/select-language');
  };

  // Combine standard and custom allergens for rendering
  const selectedStandardAllergenObjects = ALLERGEN_OPTIONS.filter(option => selectedStandardAllergens.includes(option.id));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px] overflow-y-auto">
        <div className="flex flex-col items-center text-center space-y-4 scale-[0.95]">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-200">
            {translatedTitle}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Standard Allergens */}
            {ALLERGEN_OPTIONS.map((allergen) => (
              <div 
                key={allergen.id} 
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target && (target === e.currentTarget || target.tagName === 'IMG')) {
                    handleCheckboxChange(allergen.id, !selectedStandardAllergens.includes(allergen.id));
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <img src={allergen.image} alt={allergen.name} className="w-8 h-8 object-contain" />
                  <Label htmlFor={allergen.id} className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                    {allergen.name}
                  </Label>
                </div>
                <Checkbox
                  id={allergen.id}
                  checked={selectedStandardAllergens.includes(allergen.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(allergen.id, checked as boolean)}
                  className="w-5 h-5"
                />
              </div>
            ))}

            {/* Custom Allergens (rendered alongside standard allergens, with checkbox and red 'X' in image spot) */}
            {Object.entries(customAllergens).map(([original, translations_map]) => (
              <div 
                key={original}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                onClick={(e) => {
                  // clicking the container should not remove; checkbox handles selection
                  const target = e.target as HTMLElement;
                  if (target && (target === e.currentTarget)) {
                    // toggle selection when user clicks the tile itself
                    handleCheckboxChange(original, !selectedStandardAllergens.includes(original));
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Red X box in place of image to remove the custom allergen */}
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleRemoveAllergen(original);
                    }}
                    aria-label={`Remove ${original}`}
                    className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded"
                    title="Remove custom allergen"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <Label className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 ml-2">
                    {original}
                  </Label>
                </div>

                <Checkbox
                  id={original}
                  checked={selectedStandardAllergens.includes(original)}
                  onCheckedChange={(checked) => handleCheckboxChange(original, checked as boolean)}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>

          {/* Custom Allergen Input - moved below the allergen buttons as its own row */}
          <div className="w-full mt-4">
            <div className="flex space-x-2 items-center justify-center">
              <Input
                type="text"
                placeholder={translatedPlaceholder}
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                className="flex-grow p-3 text-lg md:text-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomAllergen();
                  }
                }}
                disabled={isTranslating}
              />
              <Button onClick={handleAddCustomAllergen} disabled={isTranslating} className="py-3 px-6 text-lg md:text-xl bg-blue-600 text-white hover:bg-blue-700 h-10">
                {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : translatedAdd}
              </Button>
            </div>
          </div>

          {/* Bottom Section: Fixed height button area */}
          <div className="w-full flex justify-center items-center mt-4 mb-6">
            <Button
              onClick={handleContinue}
              disabled={[...selectedStandardAllergens, ...Object.keys(customAllergens)].length === 0}
              className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
            >
              {translatedContinue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;