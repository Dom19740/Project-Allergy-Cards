"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, Utensils, Crown, WifiOff, Camera } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import CustomAllergenImageDialog from '@/components/CustomAllergenImageDialog';
import {
  getCustomAllergenImages,
  setCustomAllergenImage,
  removeCustomAllergenImage,
  getSavedCardNamesUsingAllergen,
  getCustomAllergenNames,
  addCustomAllergenName,
  removeCustomAllergenName,
} from '@/lib/customAllergenImages';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useBilling } from '@/hooks/useBilling';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { usePageSEO } from '@/hooks/usePageSEO';

const AllergenSelectionPage = () => {
  usePageSEO({ title: 'Select Your Allergens | Simple Allergy Alert' });

  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const { isPremium } = useBilling();
  const isOnline = useNetworkStatus();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');
  const [customList, setCustomList] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [imageDialogAllergen, setImageDialogAllergen] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomAllergenImages().then(setCustomImages);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // The registry (getCustomAllergenNames) is the actual source of truth
      // for "every custom allergen this device knows about" - it's what
      // makes them show up immediately after a backup restore, rather than
      // only once a card that happens to use one gets loaded.
      const registryNames = await getCustomAllergenNames();

      const storedData = await storage.get<any>(STORAGE_KEYS.SELECTED_ALLERGENS);
      let ids: string[] = [];
      if (storedData) {
        if (Array.isArray(storedData)) {
          ids = storedData;
        } else if (storedData.ids) {
          ids = storedData.ids;
        } else if (storedData.standard) {
          ids = [...(storedData.standard || []), ...(storedData.custom || [])];
        }
        setSelectedAllergens(ids);
      }

      const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
      const customFromSelection = ids.filter(id => !standardIds.includes(id));
      setCustomList(Array.from(new Set([...registryNames, ...customFromSelection])));
    };
    loadData();
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
    addCustomAllergenName(trimmedInput);
    toast.success(`"${trimmedInput}" added.`);

    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({
        name: 'custom_allergen_added',
        params: { allergen_name: trimmedInput }
      });
    }

    setImageDialogAllergen(trimmedInput);
    setTimeout(scrollToBottom, 100);
  };

  const removeCustomAllergen = async (e: React.MouseEvent, allergen: string) => {
    e.stopPropagation();

    const cardNames = await getSavedCardNamesUsingAllergen(allergen);
    if (cardNames.length > 0) {
      toast.error(`Can't remove "${allergen}" - it's used on the saved card "${cardNames[0]}". Delete that card first.`);
      return;
    }

    setCustomList(prev => prev.filter(item => item !== allergen));
    setSelectedAllergens(prev => prev.filter(item => item !== allergen));
    setCustomImages(prev => {
      const next = { ...prev };
      delete next[allergen];
      return next;
    });
    removeCustomAllergenImage(allergen);
    removeCustomAllergenName(allergen);
    toast.info(`"${allergen}" removed.`);
  };

  const handleImageChange = async (dataUrl: string | null) => {
    const name = imageDialogAllergen;
    if (!name) {
      setImageDialogAllergen(null);
      return;
    }

    if (!dataUrl) {
      const cardNames = await getSavedCardNamesUsingAllergen(name);
      if (cardNames.length > 0) {
        toast.error(`Can't remove the photo for "${name}" - it's used on the saved card "${cardNames[0]}". Delete that card first.`);
        setImageDialogAllergen(null);
        return;
      }
    }

    setImageDialogAllergen(null);

    if (dataUrl) {
      await setCustomAllergenImage(name, dataUrl);
      setCustomImages(prev => ({ ...prev, [name]: dataUrl }));
    } else {
      await removeCustomAllergenImage(name);
      setCustomImages(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const standardAllergenIds = ALLERGEN_OPTIONS.map(opt => opt.id);
  const hasCustomAllergensSelected = selectedAllergens.some(id => !standardAllergenIds.includes(id));
  const blockedOffline = !isOnline && hasCustomAllergensSelected;

  const handleContinue = async () => {
    if (selectedAllergens.length === 0) {
      toast.error("Please select at least one allergen.");
      return;
    }
    
    const standardIds = ALLERGEN_OPTIONS.map(opt => opt.id);
    const standard = selectedAllergens.filter(id => standardIds.includes(id));
    const custom = selectedAllergens.filter(id => !standardIds.includes(id));
    
    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({
        name: 'allergens_confirmed',
        params: {
          standard_allergens: standard.join(','),
          custom_count: custom.length,
          total_count: selectedAllergens.length
        }
      });
    }

    await storage.remove(STORAGE_KEYS.SESSION_TRANSLATIONS);
    
    await storage.set(STORAGE_KEYS.SELECTED_ALLERGENS, {
      standard,
      custom,
      ids: selectedAllergens,
      persistentCustomList: customList
    });
    
    navigate(returnTo || '/select-alert');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />

      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-grow pt-1"
        >
          <StepHeader
            title="Select Allergens"
            description="Tap the allergens you want to include on your card."
          />
          
          <div className="grid grid-cols-3 gap-1.5 w-full pt-2">
            {ALLERGEN_OPTIONS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen.id);
              return (
                <div 
                  key={allergen.id} 
                  onClick={() => toggleAllergen(allergen.id)}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-0.5 py-1 px-1 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 text-center",
                    isSelected 
                      ? "bg-red-600 border-red-600 text-white" 
                      : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1 shrink-0 bg-white">
                    <img src={allergen.image} alt={allergen.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[12px] font-bold leading-tight">{allergen.name}</span>
                </div>
              );
            })}

            {customList.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen);
              return (
                <div 
                  key={allergen} 
                  onClick={() => toggleAllergen(allergen)}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-0.5 py-1 px-1 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 relative group text-center",
                    isSelected 
                      ? "bg-red-600 border-red-600 text-white" 
                      : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                  )}
                >
                  <button
                    onClick={(e) => removeCustomAllergen(e, allergen)}
                    className={cn(
                      "absolute top-0.5 right-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors",
                      isSelected ? "text-white" : "text-gray-400"
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageDialogAllergen(allergen); }}
                    className={cn(
                      "absolute bottom-0.5 right-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors",
                      isSelected ? "text-white" : "text-gray-400"
                    )}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white overflow-hidden">
                    {customImages[allergen] ? (
                      <img src={customImages[allergen]} alt={allergen} className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className={cn("w-4 h-4", isSelected ? "text-red-600" : "text-gray-500")} />
                    )}
                  </div>
                  <span className="text-[12px] font-bold leading-tight truncate w-full px-1">{allergen}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full pt-4 px-2">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add custom allergens"
                value={customAllergenInput}
                onChange={(e) => setCustomAllergenInput(e.target.value)}
                disabled={!isPremium}
                className="flex-grow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-9 px-3 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
              />
              <Button 
                onClick={handleAddCustomAllergen} 
                disabled={!isPremium}
                className="h-9 px-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm"
              >
                {isPremium ? "Add" : <Crown className="h-4 w-4" />}
              </Button>
            </div>
            {!isPremium && (
              <button
                onClick={() => navigate('/premium-onboarding', { state: { premiumReturnTo: location.pathname } })}
                className="mt-3 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
              >
                <Crown className="h-4 w-4" />
                Unlock custom allergens
              </button>
            )}
          </div>
        </motion.div>

        {blockedOffline && (
          <div className="mx-auto max-w-md mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-center shrink-0">
            <WifiOff className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Offline: Custom allergens require an internet connection to translate. Remove them or reconnect to continue.
            </p>
          </div>
        )}

        <div ref={bottomRef} className="w-full flex justify-between items-center mt-auto mb-[calc(12px+env(safe-area-inset-bottom))] pt-6 gap-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center py-3 px-8 h-auto min-w-[140px] rounded-xl bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedAllergens.length === 0 || blockedOffline}
            variant="primary"
            className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center"
          >
            Continue
          </Button>
        </div>
      </div>

      <CustomAllergenImageDialog
        isOpen={imageDialogAllergen !== null}
        allergenName={imageDialogAllergen ?? ''}
        currentImage={imageDialogAllergen ? customImages[imageDialogAllergen] : undefined}
        onClose={() => setImageDialogAllergen(null)}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default AllergenSelectionPage;