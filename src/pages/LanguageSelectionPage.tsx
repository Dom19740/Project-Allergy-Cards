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

  // Keep title in English only
  useEffect(() => {
    setTranslatedTitle("Select Target Language");
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const langs = await getAllGoogleLanguages();
      if (!mounted) return;
      
      // Explicitly sort by name to ensure alphabetical order in the UI
      const sortedLangs = [...langs].sort((a, b) => a.name.localeCompare(b.name));
      setSupportedLanguages(sortedLangs);
      
      // If current selection isn't in list, keep 'en' as default
      const hasSelected = sortedLangs.some(l => l.code === selectedLanguageCode);
      if (!hasSelected) setSelectedLanguageCode("en");
    })();
    return () => { mounted = false; };
  }, []);

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
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                aria-label="Go back"
              >
                ←
              </button>
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
                      <span>{selectedLanguage.name} ({selectedLanguage.code})</span>
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
        <div className="w-full flex justify-center items-center mt-8 mb-[50px]">
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