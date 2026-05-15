<dyad-write>
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight, Utensils, Crown } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useBilling } from '@/hooks/useBilling';
const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');
  const [customList, setCustomList] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadData = async () => {
      const storedData = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      if (storedData) {
        let ids: string[] = [];
        if (Array.isArray(storedData)) {
          ids = storedData;
        } else if (storedData.ids) {
          ids = storedData.ids;
        } else if (storedData.standard) {
          ids = [...(storedData.standard || []), ...(storedData.custom || [])];
        }
        setSelectedAllergens(ids);
        if (storedData.persistentCustomList) {
          setCustomList(storedData.persistentCustomList);
        } else {
          const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
          const custom = ids.filter(id => !standardIds.includes(id));
          setCustomList(custom);
        }
      }
    };
    loadData();
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleAddCustomAllergen = () => {
    if (!isPremium) {
      toast.error("Custom allergens are a premium feature.");
      return;
    }
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
    setTimeout(scrollToBottom, 100);
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
    await storage.remove(STORAGE_KEYS.SESSION_TRANSLATIONS);
    await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, { standard, custom, ids: selectedAllergens, persistentCustomList: customList });
    navigate('/select-alert');
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <div className="flex-grow pt-2">
          <StepHeader title="Select Allergens" description="Tap the allergens you want to include on your card." />
          <div className="grid grid-cols-3 gap-2 w-full pt-4 sm:scale-95 max-w-full max-h-full overflow-hidden">
            {ALLERGEN_OPTIONS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen.id);
              return (
                <div key={allergen.id} onClick={() => toggleAllergen(allergen.id)} className={cn(
                  "flex flex-col items-center justify-center space-y-1 py-1 px-1 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 text-center",
                  isSelected ? "bg-red-600 border-red-600 text-white" : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                )}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center p-1.5 shrink-0 bg-white">
                    <img src={allergen.image} alt={allergen.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[14px] font-bold leading-tight">{allergen.name}</span>
                </div>
              );
            })}
          </div>
          {customList.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen);
            return (
              <div key={allergen} onClick={() => toggleAllergen(allergen)} className={cn(
                "flex flex-col items-center justify-center space-y-1 py-1 px-1 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 relative group text-center",
                isSelected ? "bg-red-600 border-red-600 text-white" : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
              )}>
                <button
                  onClick={(e) => removeCustomAllergen(e, allergen)}
                  className={cn(
                    "absolute top-1 right-1 p-0.5 rounded-full hover:bg-black/10 transition-colors",
                    isSelected ? "text-white" : "text-gray-400"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white">
                  <Utensils className={cn("w-5 h-5", isSelected ? "text-red-600" : "text-gray-500")} />
                </div>
                <span className="text-[14px] font-bold leading-tight truncate w-full px-1">{allergen}</span>
              </div>
            );
          })}
        </div>
        <div className="w-full pt-8 px-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Add custom allergens"
              value={customAllergenInput}
              onChange={(e) => setCustomAllergenInput(e.target.value)}
              disabled={!isPremium}
              className="flex-grow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-10 px-4 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
            />
            <Button
              onClick={handleAddCustomAllergen}
              disabled={!isPremium}
              className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm"
            >
              {isPremium ? "Add" : <Crown className="h-4 w-4" />}
            </Button>
          </div>
          {!isPremium && (
            <button
              onClick={() => navigate('/premium-onboarding')}
              className="mt-6 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
            >
              <Crown className="h-4 w-4" />
              Unlock custom allergens
            </button>
          )}
        </div>
      </div>
      <div ref={bottomRef} className="w-full flex justify-between items-center mt-auto mb-[50px] pt-8 gap-4 shrink-0">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedAllergens.length === 0}
          className="py-3 px-8 text-lg h-auto bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
        >
          Continue <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
export default AllergenSelectionPage;