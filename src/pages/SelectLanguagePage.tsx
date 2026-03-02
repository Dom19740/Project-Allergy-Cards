"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
];

const SelectLanguagePage = () => {
  const navigate = useNavigate();

  const handleSelect = (code: string) => {
    localStorage.setItem('targetLanguage', code);
    navigate('/allergy-card');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">Select Target Language</h2>
        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => (
            <Button 
              key={lang.code} 
              variant="outline" 
              className="h-16 text-lg bg-white dark:bg-gray-800" 
              onClick={() => handleSelect(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    </div>
  );
};

export default SelectLanguagePage;