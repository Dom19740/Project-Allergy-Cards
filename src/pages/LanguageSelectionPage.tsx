"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import FixedHeader from "@/components/FixedHeader";
import StepHeader from "@/components/StepHeader";
import { getAllGoogleLanguages, SupportedLanguage } from "@/lib/translator";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useBilling } from "@/hooks/useBilling";
import { FREE_LANGUAGES } from "@/lib/premium-config";
import { toast } from "sonner";
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnBase = (location.state as { returnBase?: string } | null)?.returnBase;
  const { isPremium } = useBilling();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("es-ES");
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [isLoadingLangs, setIsLoadingLangs] = useState(true);

  useEffect(() => {
    const loadLang = async () => {
      try {
        const savedLang = await storage.get<string>(STORAGE_KEYS.SELECTED_LANGUAGE);
        if (savedLang) {
          setSelectedLanguageCode(savedLang);
        }
      } catch (e) {
        console.error("Failed to load saved language", e);
      }
    };
    loadLang();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const langs = await getAllGoogleLanguages();
        if (!mounted) return;
        
        const sortedLangs = [...langs].sort((a, b) => {
          const aFree = FREE_LANGUAGES.includes(a.code);
          const bFree = FREE_LANGUAGES.includes(b.code);
          
          if (aFree && !bFree) return -1;
          if (!aFree && bFree) return 1;
          
          if (a.code === 'en') return -1;
          if (b.code === 'en') return 1;
          
          return a.name.localeCompare(b.name);
        });
        
        setSupportedLanguages(sortedLangs);
      } catch (e) {
        console.error("Failed to load languages", e);
      } finally {
        if (mounted) setIsLoadingLangs(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLanguageChange = (code: string) => {
    const isFree = FREE_LANGUAGES.includes(code);
    
    if (!isPremium && !isFree) {
      toast.error("This language is a premium feature. Please upgrade to unlock all 100+ languages!", {
        action: {
          label: "Upgrade",
          onClick: () => navigate('/premium-onboarding')
        }
      });
      return;
    }

    setSelectedLanguageCode(code);
    storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, code);
  };

  const handleContinue = () => {
    if (selectedLanguageCode) {
      if (Capacitor.isNativePlatform()) {
        FirebaseAnalytics.logEvent({
          name: 'language_confirmed',
          params: { language_code: selectedLanguageCode }
        });
      }
      if (returnBase === '/emergency') {
        // The previously verified emergency number was for the old language,
        // so send the user back to the allergy card and have it prompt for
        // re-verification immediately instead of showing the emergency card
        // with a stale/default number.
        storage.setEphemeral(STORAGE_KEYS.OPEN_EMERGENCY_DIALOG_FLAG, 'true');
        navigate(`/alert/${selectedLanguageCode}`);
      } else {
        navigate(`${returnBase || '/alert'}/${selectedLanguageCode}`);
      }
    }
  };

  const selectedLanguage = supportedLanguages.find(l => l.code === selectedLanguageCode);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <div className="flex-grow pt-2">
          <StepHeader 
            title="Choose a Language"
            description={isPremium ? "Select any language for your card." : "Select from our free languages or upgrade to unlock all 100+."}
          />

          <div className="w-full flex justify-center pt-8 pb-4">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {isLoadingLangs ? (
                <div className="w-full py-4 flex items-center justify-center bg-white border border-gray-200 rounded-md">
                  <span className="text-gray-400">Loading languages...</span>
                </div>
              ) : (
                <Select value={selectedLanguageCode} onValueChange={handleLanguageChange}>
                  <SelectTrigger
                    className="w-full py-4 text-lg md:text-xl h-auto bg-white text-gray-900 hover:bg-gray-50 border border-red-600 dark:border-red-500"
                  >
                    <div className="flex items-center">
                      {selectedLanguage ? (
                        <span>{selectedLanguage.name}</span>
                      ) : (
                        <SelectValue placeholder="Select Target Language" />
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 max-h-[50vh]">
                    {supportedLanguages.map((lang) => {
                      const isLocked = !isPremium && !FREE_LANGUAGES.includes(lang.code);
                      return (
                        <SelectItem
                          key={lang.code}
                          value={lang.code}
                          className="py-3 text-lg md:text-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{lang.name}</span>
                            {isLocked && <Lock className="h-4 w-4 text-amber-500" />}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              
              {!isPremium && (
                <button 
                  onClick={() => navigate('/premium-onboarding')}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
                >
                  <Crown className="h-4 w-4" />
                  Unlock 100+ more languages
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-between items-center mt-auto mb-[calc(12px+env(safe-area-inset-bottom))] gap-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center py-3 px-8 h-auto min-w-[140px] rounded-xl bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedLanguageCode}
            variant="primary"
            className="py-3 px-8 text-lg h-auto min-w-[140px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionPage;