"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    title: "Welcome to Allergy Alert",
    description: "Your essential travel companion for managing dietary restrictions safely across the globe.",
    image: "/logo_main.png"
  },
  {
    title: "Multi-Language Support",
    description: "Translate your allergies into dozens of languages instantly to ensure you're understood anywhere.",
    image: "/logo_main.png"
  },
  {
    title: "Emergency Ready",
    description: "Quick access to emergency medical cards when you need them most.",
    image: "/logo_main.png"
  }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
      navigate('/premium-onboarding');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-900">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-48 h-48 mb-12 flex items-center justify-center">
          <img 
            src={slides[currentSlide].image} 
            alt="Onboarding" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {slides[currentSlide].title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xs">
          {slides[currentSlide].description}
        </p>
      </div>

      <div className="p-8 flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-red-600" : "w-2 bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {currentSlide > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex-1 py-6 rounded-2xl"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className="flex-1 py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;