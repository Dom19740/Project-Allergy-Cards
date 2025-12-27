"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        const parsedAllergens = JSON.parse(storedAllergens);
        if (Array.isArray(parsedAllergens)) {
          setSelectedAllergens(parsedAllergens);
        }
      } catch (e) {
        console.error("Failed to parse stored allergens from localStorage", e);
        localStorage.removeItem('selectedAllergens'); // Clear invalid data
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
    localStorage.setItem('selectedAllergens', JSON.stringify(selectedAllergens));
    navigate('/select-language');
  };

  // Separate predefined and custom allergens for rendering
  const predefinedSelected = ALLERGEN_OPTIONS.filter(option => selectedAllergens.includes(option.id));
  const customSelected = selectedAllergens.filter(allergen => 
    !ALLERGEN_OPTIONS.some(option => option.id === allergen)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-4 pt-[126px]">
      <FixedHeader />
      
      {/* Central Content Area */}
      <div className="flex flex-col items-center flex-grow justify-start w-full max-w-2xl px-4 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-200 text-center">
          Select Allergens
        </h2>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          {ALLERGEN_OPTIONS.map((allergen) => (
            <div 
              key={allergen.id} 
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer"
              onClick={() => handleCheckboxChange(allergen.id, !selectedAllergens.includes(allergen.id))}
            >
              <div className="flex items-center space-x-3">
                <img src={allergen.image} alt={allergen.name} className="w-8 h-8 object-contain" />
                <Label htmlFor={allergen.id} className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                  {allergen.name}
                </Label>
              </div>
              <Checkbox
                id={allergen.id}
                checked={selectedAllergens.includes(allergen.id)}
                className="w-5 h-5"
              />
            </div>
          ))}
        </div>

        {/* Custom Allergen Input */}
        <div className="w-full">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Add your own allergen"
              value={customAllergenInput}
              onChange={(e) => setCustomAllergenInput(e.target.value)}
              className="flex-grow p-3 text-lg md:text-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 h-10"
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Custom Allergens will not be translated, add them in your target language</p>
        </div>

        {/* Display selected custom allergens */}
        {customSelected.length > 0 && (
          <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Your Custom Allergens:</h3>
            <div className="flex flex-wrap gap-2">
              {customSelected.map((allergen) => (
                <span key={allergen} className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full text-base">
                  {allergen}
                  <button 
                    onClick={() => handleRemoveAllergen(allergen)} 
                    className="ml-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                    aria-label={`Remove ${allergen}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button Container for Continue */}
      <div className="w-full max-w-2xl flex justify-center items-center mt-8 mb-[50px]">
        <Button
          onClick={handleContinue}
          disabled={selectedAllergens.length === 0}
          className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;