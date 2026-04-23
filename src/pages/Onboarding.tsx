"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { ChevronRight, ChevronLeft, Globe, Shield, Heart } from 'lucide-react';

const steps = [
  {
    title: "Welcome to Allergy Alert",
    description: "Your safety companion for dining out and traveling with dietary restrictions.",
    icon: <Heart className="h-16 w-16 text-red-500" />,
    color: "bg-red-50 dark:bg-red-900/20"
  },
  {
    title: "Multi-Language Support",
    description: "Translate your allergies into over 20 languages to communicate clearly anywhere in the world.",
    icon: <Globe className="h-16 w-16 text-blue-500" />,
    color: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    title: "Emergency Ready",
    description: "Create emergency cards that provide critical information to first responders when you can't.",
    icon: <Shield className="h-16 w-16 text-green-500" />,
    color: "bg-green-50 dark:bg-green-900/20"
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
      navigate('/unlock-premium');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-32 h-32 ${step.color} rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500`}>
          {step.icon}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step.title}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700">
          {step.description}
        </p>
      </div>

      <div className="p-8 flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-red-600' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button 
              variant="outline"
              onClick={handleBack}
              className="flex-1 py-6 rounded-2xl border-2"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className="flex-1 py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            {currentStep !== steps.length - 1 && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;