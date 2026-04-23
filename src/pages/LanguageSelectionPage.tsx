"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Globe, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { cn } from '@/lib/utils';
import { useBilling } from '@/hooks/useBilling';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  useEffect(() => {
    const loadData = async () => {
      const storedLangs = await storage.get<string[]>(STORAGE_KEYS.SELECTED_LANGUAGES);
      if (storedLangs && storedLangs.length > 0) {
        setSelectedLanguages(storedLangs);
      }
    };
    loadData();
  }, []);

  const toggleLanguage = (code: string) => {
    if (code === 'en') return; // English is always selected

    if (!isPremium && !selectedLanguages.includes(code) && selectedLanguages.length >= 2) {
      navigate('/premium-onboarding');
      return;
    }

    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = async () => {
    await storage.set(STORAGE_KEYS.SELECTED_LANGUAGES, selectedLanguages);
    navigate('/preview');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(env(safe-area-inset-top)+10px)]">
        <div className="flex-grow pt-2">
          <StepHeader 
            title="Select Languages"
            description={isPremium 
              ? "Choose as many languages as you need for your card." 
              : "Choose up to 2 languages. Upgrade to Premium for unlimited."}
          />
          
          <div className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.code);
                const isEnglish = lang.code === 'en';
                
                return (
                  <div 
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "bg-red-50 border-red-600 dark:bg-red-900/20" 
                        : "bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                        <Globe className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{lang.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lang.nativeName}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-red-600 bg-red-600" : "border-gray-300 dark:border-gray-600",
                      isEnglish && "opacity-50 cursor-not-allowed"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isPremium && (
              <button 
                onClick={() => navigate('/premium-onboarding')}
                className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30 flex items-center justify-between group hover:border-amber-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-amber-900 dark:text-amber-100">Unlock Unlimited Languages</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Get access to all 50+ languages</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] pt-8 gap-4 shrink-0">
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