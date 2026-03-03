"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Languages } from "lucide-react";
import FixedHeader from "@/components/FixedHeader";
import { getAllGoogleLanguages, SupportedLanguage } from "@/lib/translator";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("en");
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguageCode");
    if (savedLang) {
      setSelectedLanguageCode(savedLang);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const langs = await getAllGoogleLanguages();
      if (!mounted) return;
      const sortedLangs = [...langs].sort((a, b) => a.name.localeCompare(b.name));
      setSupportedLanguages(sortedLangs);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedLanguageCode", selectedLanguageCode);
  }, [selectedLanguageCode]);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguageCode(code);
  };

  const handleContinue = () => {
    if (selectedLanguageCode) {
      navigate(`/alert/${selectedLanguageCode}`);
    }
  };

  const selectedLanguage = supportedLanguages.find(l => l.code === selectedLanguageCode);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Standardized Icon Header */}
            <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
              <Languages className="w-16 h-16 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                Choose a Language
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Select the language you want your allergy alert to be translated into.
              </p>
            </div>

            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg pt-4">
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
                  {(supportedLanguages.length ? supportedLanguages : [{ code: "en", name: "English" }]).map((lang) => (
                    <SelectItem
                      key={lang.code}
                      value={lang.code}
                      className="py-3 text-lg md:text-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-between items-center mt-8 mb-[50px] gap-4 shrink-0">
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
            disabled={!selectedLanguageCode}
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