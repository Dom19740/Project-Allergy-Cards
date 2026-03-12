import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');

  // Load selected allergens from storage on mount
  useEffect(() => {
    const loadAllergens = async () => {
      const storedAllergens = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      if (storedAllergens) {
        if (Array.isArray(storedAllergens)) {
          setSelectedAllergens(storedAllergens);
        } else if (storedAllergens.ids) {
          setSelectedAllergens(storedAllergens.ids);
        } else if (storedAllergens.standard) {
          setSelectedAllergens([...(storedAllergens.standard || []), ...(storedAllergens.custom || [])]);
        }
      }
    };
    loadAllergens();
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

  const customSelected = selectedAllergens.filter(allergen => 
    !ALLERGEN_OPTIONS.some(option => option.id === allergen)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto pt-8">
          <StepHeader 
            title="Select Allergens"
            description="Choose from our standard list or add your own custom allergens."
          />
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full pt-8">
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
                  <Label htmlFor={allergen.id} className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
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

          <div className="w-full pt-6 pb-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add your own allergen, one at a time"
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                className="flex-grow ml-[10px] p-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-400 h-9"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomAllergen();
                  }
                }}
              />
              <Button onClick={handleAddCustomAllergen} className="py-2 px-4 text-sm bg-blue-600 text-white hover:bg-blue-700 h-9">
                Add
              </Button>
            </div>
          </div>

          {customSelected.length > 0 && (
            <div className="w-full p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-100">Your Custom Allergens:</h3>
              <div className="flex flex-wrap gap-1.5">
                {customSelected.map((allergen) => (
                  <span key={allergen} className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                    {allergen}
                    <button 
                      onClick={() => handleRemoveAllergen(allergen)} 
                      className="ml-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] gap-4 shrink-0">
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
  );
};

export default AllergenSelectionPage;