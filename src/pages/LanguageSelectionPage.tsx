"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await storage.get<string>(STORAGE_KEYS.SELECTED_LANGUAGE);
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = async () => {
    if (!selectedLanguage) return;
    await storage.set(STORAGE_KEYS.SELECTED_LANGUAGE, selectedLanguage);
    navigate('/select-allergens');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[80px]">
        <div className="flex-grow pt-0">
          <StepHeader 
            title="Select Language"
            description="Choose the language you want your allergy card translated into."
          />
          
          <div className="relative mt-8 mb-4 px-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 px-2 max-h-[40vh] overflow-y-auto pb-4">
            {filteredLanguages.map((lang) => (
              <div 
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2",
                  selectedLanguage === lang.code 
                    ? "bg-red-600 border-red-600 text-white" 
                    : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Globe className={cn("w-5 h-5", selectedLanguage === lang.code ? "text-white" : "text-gray-400")} />
                  <div>
                    <p className="font-bold text-base">{lang.name}</p>
                    <p className={cn("text-xs", selectedLanguage === lang.code ? "text-red-100" : "text-gray-500")}>
                      {lang.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] pt-12 gap-4 shrink-0">
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
            disabled={!selectedLanguage}
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