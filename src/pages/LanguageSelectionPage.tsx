"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FixedHeader from "@/components/FixedHeader";
import { getAllGoogleLanguages, SupportedLanguage } from "@/lib/translator";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>("en");
  const [translatedTitle, setTranslatedTitle] = useState("Select Target Language");
  const [translatedContinue, setTranslatedContinue] = useState("Continue");
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);

  // Load selected language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguageCode");
    if (savedLang) {
      setSelectedLanguageCode(savedLang);
    }
  }, []);

  // Keep title in English only
  useEffect(() => {
    setTranslatedTitle("Select Target Language");
  }, []);

  // Load supported languages
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

  // Persist selected language when it changes
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
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200">
                {translatedTitle}
              </h2>
            </div>
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <Select value={selectedLanguageCode} onValueChange={handleLanguageChange}>
                <SelectTrigger
                  className="w-full py-4 text-lg md:text-xl h-auto bg-white text-gray-900 hover:bg-gray-50 border border-red-600 dark:border-red-500 mx-[0px]"
                >
                  <div className="flex items-center">
                    {selectedLanguage ? (
                      <span>{selectedLanguage.name}</span>
                    ) : (
                      <SelectValue placeholder={translatedTitle} />
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
        <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-8 mb-[50px] gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-gray-200 text-gray-800 hover:bg-gray-300 w-[280px]"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedLanguageCode}
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            {translatedContinue}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionPage;