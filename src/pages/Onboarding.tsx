"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldAlert, Languages, Share2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import OnboardingStep from '@/components/OnboardingStep';

const ONBOARDING_STEPS = [
  {
    title: "Select Your Allergens",
    description: "Choose from our standard list or add your own custom allergens. We'll make sure they're clearly communicated.",
    icon: ShieldAlert,
  },
  {
    title: "Choose a Language",
    description: "Traveling abroad? Select from over 100 languages to translate your allergy alert instantly.",
    icon: Languages,
  },
  {
    title: "Share & Save",
    description: "Download your card as an image, share it with others, or save up to 3 cards for quick access later.",
    icon: Share2,
  },
  {
    title: "Emergency Ready",
    description: "In urgent situations, use the Emergency Card to quickly communicate your needs to first responders.",
    icon: AlertTriangle,
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/select-allergens');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/select-allergens');
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px] overflow-hidden">
        <div className="flex-grow overflow-y-auto pt-8">
          <OnboardingStep 
            key={currentStep}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        </div>

        <div className="w-full flex flex-col items-center mt-auto mb-[50px] space-y-8 shrink-0">
          <div className="flex space-x-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div 
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "bg-red-600 w-6" 
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          <div className="w-full flex justify-between items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              {currentStep === 0 ? "Skip" : "Back"}
            </Button>

            <Button
              onClick={handleNext}
              className="py-3 px-8 text-lg h-auto bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
              {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;