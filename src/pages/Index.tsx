"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Languages, 
  Smartphone, 
  Share2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepHeader from '@/components/StepHeader';
import { useBilling } from '@/hooks/useBilling';

const Index = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Select Allergens",
      description: "Choose the allergens you need to avoid. We'll handle the translations.",
      icon: AlertCircle,
      action: () => navigate('/select-allergens'),
      buttonText: "Get Started"
    },
    {
      title: "Choose Languages",
      description: "Select the languages for your destination. We support over 100 languages.",
      icon: Languages,
      action: () => navigate('/select-languages'),
      buttonText: "Select Languages"
    },
    {
      title: "Add a Widget",
      description: "Add a widget to your home screen for instant access to your allergy cards.",
      icon: Smartphone,
      action: () => navigate('/widget-instructions'),
      buttonText: "Learn How"
    },
    {
      title: "Share & Save",
      description: "Share your cards with travel companions or save them for offline use.",
      icon: Share2,
      action: () => navigate('/my-cards'),
      buttonText: "View My Cards"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-12">
        <div className="w-full max-w-md">
          <StepHeader 
            title={steps[currentStep].title}
            description={steps[currentStep].description}
            icon={steps[currentStep].icon}
          />
        </div>

        <div className="w-full max-w-md space-y-4">
          <Button 
            onClick={steps[currentStep].action}
            className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/10 transition-all active:scale-[0.98]"
          >
            {steps[currentStep].buttonText}
          </Button>

          <div className="flex items-center justify-between px-2">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-500 disabled:opacity-0"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'w-6 bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="text-gray-500 disabled:opacity-0"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;