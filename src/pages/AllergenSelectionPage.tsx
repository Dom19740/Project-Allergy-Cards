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

  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    if (storedAllergens) {
      try {
        const parsed = JSON.parse(storedAllergens);
        if (Array.isArray(parsed)) {
          setSelectedAllergens(parsed);
        } else if (parsed.ids) {
          setSelectedAllergens(parsed.ids);
        }
      } catch (e) {
        console.error("Failed to parse stored allergens", e);
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
    toast.success(`"${trimmedInput}" added.`);
  };

  const handleRemoveAllergen = (allergenToRemove: string) => {
    setSelectedAllergens(prev => prev.filter(allergen => allergen !== allergenToRemove));
  };

  const handleContinue = () => {
    if (selectedAllergens.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    
    const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
    const standard = selectedAllergens.filter(id => standardIds.includes(id));
    const custom = selectedAllergens.filter(id => !standardIds.includes(id));
    
    localStorage.setItem('selectedAllergens', JSON.stringify({
      standard,
      custom,
      ids: selectedAllergens
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
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              Select Allergens
            </h2>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <div 
                  key={allergen.id} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer"
                  onClick={() => handleCheckboxChange(allergen.id, !selectedAllergens.includes(allergen.id))}
                >
                  <div className="flex items-center space-x-3">
                    <img src={allergen.image} alt={allergen.name} className="w-8 h-8 object-contain" />
                    <Label className="text-base font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                      {allergen.name}
                    </Label>
                  </div>
                  <Checkbox
                    checked={selectedAllergens.includes(allergen.id)}
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
                  className="flex-grow ml-[10px] p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm h-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
                />
                <Button onClick={handleAddCustomAllergen} className="bg-blue-600 text-white h-10">
                  Add
                </Button>
              </div>
            </div>

            {customSelected.length > 0 && (
              <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-2">
                  {customSelected.map((allergen) => (
                    <span key={allergen} className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                      {allergen}
                      <button onClick={() => handleRemoveAllergen(allergen)} className="ml-2">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-8 mb-[50px] gap-4">
          <Button onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 w-[280px]">Back</Button>
          <Button onClick={handleContinue} disabled={selectedAllergens.length === 0} className="bg-red-600 text-white w-[280px]">Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;