"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedStandardAllergens, setSelectedStandardAllergens] = useState<string[]>([]);
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');

  // Load selected allergens from local storage on mount
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        // Support both old and new storage formats
        if (parsed.standard) {
          setSelectedStandardAllergens(parsed.standard || []);
          // If custom was an object of translations, just take the keys
          const customData = parsed.custom || {};
          setCustomAllergens(Array.isArray(customData) ? customData : Object.keys(customData));
        } else if (Array.isArray(parsed)) {
          // Fallback for very old format
          const standardIds = ALLERGEN_OPTIONS.map(o => o.id);
          setSelectedStandardAllergens(parsed.filter(id => standardIds.includes(id)));
          setCustomAllergens(parsed.filter(id => !standardIds.includes(id)));
        }
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
      }
    }
  }, []);

  const handleToggleStandardAllergen = (allergenId: string) => {
    setSelectedStandardAllergens(prev => 
      prev.includes(allergenId) 
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  const handleAddCustomAllergen = () => {
    const trimmedInput = customAllergenInput.trim();
    if (!trimmedInput) {
      toast.error("Custom allergen cannot be empty.");
      return;
    }

    if (
      ALLERGEN_OPTIONS.some(opt => opt.name.toLowerCase() === trimmedInput.toLowerCase()) ||
      customAllergens.some(allergen => allergen.toLowerCase() === trimmedInput.toLowerCase())
    ) {
      toast.warning("This allergen is already in your list.");
      return;
    }

    setCustomAllergens(prev => [...prev, trimmedInput]);
    setCustomAllergenInput('');
    toast.success(`"${trimmedInput}" added.`);
  };

  const handleRemoveCustomAllergen = (allergenToRemove: string) => {
    setCustomAllergens(prev => prev.filter(id => id !== allergenToRemove));
    toast.info(`"${allergenToRemove}" removed.`);
  };

  const handleContinue = () => {
    if (selectedStandardAllergens.length === 0 && customAllergens.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    
    // Save to localStorage - AllergyCard will handle the translation of these strings
    const dataToStore = { 
      standard: selectedStandardAllergens, 
      custom: customAllergens 
    };
    localStorage.setItem('selectedAllergens', JSON.stringify(dataToStore));
    navigate('/select-language');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px] overflow-y-auto">
        <div className="flex flex-col items-center text-center space-y-4 scale-[0.95]">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-200">
            Select Allergens
          </h2>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Standard Allergens */}
            {ALLERGEN_OPTIONS.map((allergen) => {
              const isSelected = selectedStandardAllergens.includes(allergen.id);
              return (
                <div 
                  key={allergen.id} 
                  className={`flex items-center justify-between p-3 rounded-lg shadow-sm cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-gray-200 dark:bg-gray-700 border-2 border-red-500' 
                      : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => handleToggleStandardAllergen(allergen.id)}
                >
                  <div className="flex items-center space-x-3">
                    <img src={allergen.image} alt={allergen.name} className="w-8 h-8 object-contain" />
                    <span className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200">
                      {allergen.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Custom Allergens */}
            {customAllergens.map((allergen) => (
              <div 
                key={allergen}
                className="flex items-center justify-between p-3 rounded-lg shadow-sm bg-gray-200 dark:bg-gray-700 border-2 border-red-500"
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleRemoveCustomAllergen(allergen)}
                    className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 ml-2">
                    {allergen}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full mt-4">
            <div className="flex space-x-2 items-center justify-center">
              <Input
                type="text"
                placeholder="Add your own allergen"
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                className="flex-grow p-3 text-lg md:text-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomAllergen();
                  }
                }}
              />
              <Button onClick={handleAddCustomAllergen} className="py-3 px-6 text-lg md:text-xl bg-blue-600 text-white hover:bg-blue-700 h-10">
                Add
              </Button>
            </div>
          </div>

          <div className="w-full flex justify-center items-center mt-4 mb-6">
            <Button
              onClick={handleContinue}
              className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;