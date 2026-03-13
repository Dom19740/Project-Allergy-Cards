"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');
  const [customList, setCustomList] = useState<string[]>([]);

  // Load selected allergens from storage on mount
  useEffect(() => {
    const loadAllergens = async () => {
      const storedAllergens = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      if (storedAllergens) {
        let ids: string[] = [];
        if (Array.isArray(storedAllergens)) {
          ids = storedAllergens;
        } else if (storedAllergens.ids) {
          ids = storedAllergens.ids;
        } else if (storedAllergens.standard) {
          ids = [...(storedAllergens.standard || []), ...(storedAllergens.custom || [])];
        }
        setSelectedAllergens(ids);
        
        // Identify which ones are custom to populate the custom list
        const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
        const custom = ids.filter(id => !standardIds.includes(id));
        setCustomList(custom);
      }
    };
    loadAllergens();
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomAllergen = () => {
    const trimmedInput = customAllergenInput.trim();
    if (!trimmedInput) {
      toast.error("Custom allergen cannot be empty.");
      return;
    }
    if (customList.includes(trimmedInput) || ALLERGEN_OPTIONS.some(opt => opt.name.toLowerCase() === trimmedInput.toLowerCase())) {
      toast.warning("This allergen is already in the list.");
      return;
    }
    
    setCustomList(prev => [...prev, trimmedInput]);
    setSelectedAllergens(prev => [...prev, trimmedInput]);
    setCustomAllergenInput('');
    toast.success(`"${trimmedInput}" added.`);
  };

  const removeCustomAllergen = (e: React.MouseEvent, allergen: string) => {
    e.stopPropagation();
    setCustomList(prev => prev.filter(item => item !== allergen));
    setSelectedAllergens(prev => prev.filter(item => item !== allergen));
    toast.info(`"${allergen}" removed.`);
  };

  const handleContinue = async () => {
    if (selectedAllergens.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    
    const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
    const standard = selectedAllergens.filter(id => standardIds.includes(id));
    const custom = selectedAllergens.filter(id => !standardIds.includes(id));
    
    await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, {
      standard,
      custom,
      ids: selectedAllergens
    });
    
    navigate('/select-alert');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto pt-4 pb-24">
          <StepHeader 
            title="Select Allergens"
            description="Tap the allergens you want to include on your card."
          />
          
          <div className="grid grid-cols-2 gap-2 w-full pt-6">
            {/* Standard Allergens */}
            {ALLERGEN_OPTIONS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen.id);
              return (
                <div 
                  key={allergen.id} 
                  onClick={() => toggleAllergen(allergen.id)}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2",
                    isSelected 
                      ? "bg-red-600 border-red-600 text-white" 
                      : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center p-1 shrink-0",
                    isSelected ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                  )}>
                    <img src={allergen.image} alt={allergen.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{allergen.name}</span>
                </div>
              );
            })}

            {/* Custom Allergens */}
            {customList.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen);
              return (
                <div 
                  key={allergen} 
                  onClick={() => toggleAllergen(allergen)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 relative group",
                    isSelected 
                      ? "bg-red-600 border-red-600 text-white" 
                      : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                  )}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold leading-tight truncate">{allergen}</span>
                  </div>
                  <button 
                    onClick={(e) => removeCustomAllergen(e, allergen)}
                    className={cn(
                      "p-1 rounded-full hover:bg-black/10 transition-colors",
                      isSelected ? "text-white/80" : "text-gray-400"
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Custom Input */}
          <div className="w-full pt-6">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add custom allergen..."
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                className="flex-grow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-10 px-4 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
              />
              <Button 
                onClick={handleAddCustomAllergen} 
                className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 dark:from-gray-900 via-gray-100 dark:via-gray-900 to-transparent pt-10 pb-8 px-4">
          <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={selectedAllergens.length === 0}
              className="py-3 px-8 text-lg h-auto bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergenSelectionPage;