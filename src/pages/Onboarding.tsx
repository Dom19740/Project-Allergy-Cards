"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { ChevronRight, ChevronLeft, ShieldAlert, Languages, AlertTriangle } from 'lucide-react';
import OnboardingStep from '@/components/OnboardingStep';

const slides = [
  {
    title: "Welcome to Allergy Alert",
    description: "Your essential travel companion for managing dietary restrictions safely across the globe.",
    icon: ShieldAlert,
    image: "/logo_main.png"
  },
  {
    title: "Multi-Language Support",
    description: "Translate your allergies into dozens of languages instantly to ensure you're understood anywhere.",
    icon: Languages,
    image: "/logo_main.png"
  },
  {
    title: "Emergency Ready",
    description: "Quick access to emergency medical cards when you need them most.",
    icon: AlertTriangle,
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

  const currentStep = slides[currentSlide];

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <OnboardingStep 
          title={currentStep.title}
          description={currentStep.description}
          icon={currentStep.icon}
          image={currentStep.image}
        />
      </div>

      <div className="p-8 flex flex-col gap-4 bg-white dark:bg-gray-900 z-10">
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
              variant="ghost" 
              onClick={handleBack}
              className="flex-1 py-6 rounded-2xl text-gray-500"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className="flex-1 py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
          >
            {currentSlide === slides.length - 1 ? "Continue" : "Next"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;