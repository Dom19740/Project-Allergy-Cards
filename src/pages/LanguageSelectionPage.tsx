"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, WifiOff, Crown, Lock } from "lucide-react";
import FixedHeader from "@/components/FixedHeader";
import StepHeader from "@/components/StepHeader";
import { getAllGoogleLanguages, SupportedLanguage } from "@/lib/translator";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useBilling } from "@/hooks/useBilling";
import { FREE_LANGUAGES } from "@/lib/premium-config";
import { toast } from "sonner";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
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
      navigate(`/alert/${selectedLanguageCode}`);
    }
  };

  const selectedLanguage = supportedLanguages.find(l => l.code === selectedLanguageCode);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)] overflow-hidden">
        <div className="flex-grow overflow-y-auto pt-2">
          <StepHeader 
            title="Choose a Language"
            description={isPremium ? "Select any language for your alert." : "Select from our free languages or upgrade to unlock all 100+."}
          />

          {!isOnline && (
            <div className="mx-auto max-w-md mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-center">
              <WifiOff className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Offline: Translations for new cards requires an internet connection
              </p>
            </div>
          )}

          <div className="w-full flex justify-center pt-8 pb-4">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {isLoadingLangs ? (
                <div className="w-full py-4 flex items-center justify-center bg-white border border-gray-200 rounded-md">
                  <span className="text-gray-400">Loading languages...</span>
                </div>
              ) : (
                <Select value={selectedLanguageCode} onValueChange={handleLanguageChange} disabled={!isOnline}>
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
                  className="mt-4 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
                >
                  <Crown className="h-4 w-4" />
                  Unlock 100+ more languages
                </button>
              )}
            </div>
          </div>
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
            disabled={!selectedLanguageCode || (!isOnline && selectedLanguageCode !== 'en')}
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

export default LanguageSelectionPage;