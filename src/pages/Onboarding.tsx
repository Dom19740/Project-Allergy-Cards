"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ShieldAlert, Languages, Share2, AlertTriangle, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import OnboardingStep from '@/components/OnboardingStep';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const ONBOARDING_STEPS = [
  {
    title: "Safety First",
    description: "This app provides translated allergy alerts for convenience. While we aim for accuracy, translations and emergency numbers may not always be correct. Always verify important information locally when possible. If in doubt, do not eat.",
    icon: Info,
  },
  {
    title: "Select Your Allergens",
    description: "Choose from our standard list or add your own custom allergens. Customise your allergy alert warnings.",
    icon: ShieldAlert,
  },
  {
    title: "Choose a Language",
    description: "Select from over 100 languages to translate your allergy alert instantly.",
    icon: Languages,
  },
  {
    title: "Share & Save",
    description: "Download your card as an image, share it with others, or save up to 3 cards in the app for quick access later.",
    icon: Share2,
  },
  {
    title: "Emergency Ready",
    description: "In urgent situations, use the Emergency Card to quickly communicate your need for medical attention.",
    icon: AlertTriangle,
  },
  {
    title: "Add a Widget",
    description: "Add our widget to your home screen for instant access to your saved cards and one-tap emergency alerts, even when offline.",
    icon: LayoutGrid,
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps'
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentStep(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const finishOnboarding = async () => {
    await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
    navigate('/premium-onboarding');
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      emblaApi?.scrollNext();
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      emblaApi?.scrollPrev();
    } else {
      // If they skip from the first page, we still mark onboarding as seen
      finishOnboarding();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)] overflow-hidden">
        {/* Carousel Viewport */}
        <div className="flex-grow overflow-hidden pt-8 cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex h-full">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                <OnboardingStep 
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-auto mb-[calc(50px+env(safe-area-inset-bottom))] space-y-8 shrink-0">
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
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Next" : "Next"}
              {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;