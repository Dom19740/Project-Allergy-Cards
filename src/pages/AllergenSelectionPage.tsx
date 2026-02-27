"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');

  // Load selected allergens from local storage on mount
  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        // Handle both old array format and new object format
        if (Array.isArray(parsed)) {
          setSelectedAllergens(parsed);
        } else if (parsed.ids) {
          setSelectedAllergens(parsed.ids);
        } else if (parsed.standard) {
          // Handle standard/custom split format
          setSelectedAllergens([...(parsed.standard || []), ...(parsed.custom || [])]);
        }
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
      }
    }
  }, []);

  const handleCheckboxChange = (allergenId: string, checked: boolean) => {
    setSelectedAllergens(prev => 
      checked ? [...prev, allergenId] : prev.filter(id => id !== allergenId)
    );
  };

  const handleAddCustomAllergen = () => {
    const trimmedInput = customAllergenInput.trim();
    if (!trimmedInput) {
      toast.error("Custom allergen cannot be empty.");
      return;
    }
    if (selectedAllergens.includes(trimmedInput)) {
      toast.warning("This allergen is already added.");
      return;
    }
    setSelectedAllergens(prev => [...prev, trimmedInput]);
    setCustomAllergenInput('');
    toast.success(`"${trimmedInput}" added to your allergens.`);
  };

  const handleRemoveAllergen = (allergenToRemove: string) => {
    setSelectedAllergens(prev => prev.filter(allergen => allergen !== allergenToRemove));
    toast.info(`"${allergenToRemove}" removed.`);
  };

  const handleContinue = () => {
    if (selectedAllergens.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    
    // Save in a consistent format for the AllergyCard
    const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
    const standard = selectedAllergens.filter(id => standardIds.includes(id));
    const custom = selectedAllergens.filter(id => !standardIds.includes(id));
    
    localStorage.setItem('selectedAllergens', JSON.stringify({
      standard,
      custom,
      ids: selectedAllergens // Keep flat list for compatibility
    }));
    
    navigate('/select-alert');
  };

  const customSelected = selectedAllergens.filter(allergen => 
    !ALLERGEN_OPTIONS.some(option => option.id === allergen)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200">
              Select Allergens
            </h2>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <div 
                  key={allergen.id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer"
                  onClick={(e) => {
                    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
                      handleCheckboxChange(allergen.id, !selectedAllergens.includes(allergen.id));
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <img src={allergen.image} alt={allergen.name} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                    <Label htmlFor={allergen.id} className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                      {allergen.name}
                    </Label>
                  </div>
                  <Checkbox
                    id={allergen.id}
                    checked={selectedAllergens.includes(allergen.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(allergen.id, !!checked)}
                    className="w-5 h-5"
                  />
                </div>
              ))}
            </div>

            <div className="w-full">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add your own allergen"
                  value={customAllergenInput}
                  onChange={(e) => setCustomAllergenInput(e.target.value)}
                  className="flex-grow p-2 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 h-9"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomAllergen();
                    }
                  }}
                />
                <Button onClick={handleAddCustomAllergen} className="py-2 px-4 text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 h-9">
                  Add
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Custom Allergens will not be translated, add them in your target language</p>
            </div>

            {customSelected.length > 0 && (
              <div className="w-full p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Your Custom Allergens:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {customSelected.map((allergen) => (
                    <span key={allergen} className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-0.5 rounded-full text-sm">
                      {allergen}
                      <button 
                        onClick={() => handleRemoveAllergen(allergen)} 
                        className="ml-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center items-center mt-8 mb-[50px]">
          <Button
            onClick={handleContinue}
            disabled={selectedAllergens.length === 0}
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;