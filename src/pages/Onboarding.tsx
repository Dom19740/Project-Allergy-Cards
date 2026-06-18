"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import FixedHeader from '@/components/FixedHeader';
import OnboardingStep from '@/components/OnboardingStep';

const ONBOARDING_STEPS = [
  {
    title: "Safety First",
    description: "This app is not a medical device. It provides translated allergy alerts for convenience. Translations are machine-generated and may contain errors. Do not rely on this app as your sole means of communicating a life-threatening allergy. Always carry your prescribed medication. By using this app you agree to our Terms & Conditions and Privacy Policy. If in doubt, do no eat.",
    image: "/images/screenshot_1.png"
  },
  {
    title: "Intro",
    description: "Create personalized allergy alerts in over 100 languages to communicate your dietary restrictions easily and safely.",
    image: "/images/screenshot_1.png"
  },
  {
    title: "Select Your Allergens",
    description: "Choose from our standard list or add your own custom allergens. Customise your allergy alert warnings.",
    image: "/images/screenshot_2.png"
  },
  {
    title: "Choose a Language",
    description: "Select from over 100 languages to translate your allergy alert instantly.",
    image: "/images/screenshot_3.png"
  },
  {
    title: "Share & Save",
    description: "Save up to 10 cards in the app for quick offline access. Download your card as an image, share it with others.",
    image: "/images/screenshot_4_alternate.png"
  },
  {
    title: "Emergency Ready",
    description: "In urgent situations, use the Emergency Card to quickly communicate your need for medical attention. Quick dial button to local emergency services.",
    image: "/images/screenshot_5_alternate.png"
  },
  {
    title: "Add a Widget",
    description: "Add our widget to your home screen for instant access to your saved cards and one-tap emergency alerts, even when offline.",
    image: "/images/screenshot_6.png"
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

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

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      emblaApi?.scrollNext();
    } else {
      await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
      navigate('/premium-onboarding');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      emblaApi?.scrollPrev();
    }
  };

  const handleUnderstand = async () => {
    await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
    emblaApi?.scrollNext();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)] overflow-hidden">
        <div className="flex-grow overflow-hidden pt-4 cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex h-full">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-4 h-full">
                <OnboardingStep 
                  title={step.title}
                  description={step.description}
                  image={step.image}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-auto mb-[calc(20px+env(safe-area-inset-bottom))] space-y-6 shrink-0">
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

          <div className="w-full flex items-center gap-4 pb-4">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl border-2 font-semibold h-auto"
              >
                <ChevronRight className="mr-2 h-5 w-5 rotate-180" />
                Back
              </Button>
            )}

            {currentStep === 0 ? (
              <Button
                onClick={handleUnderstand}
                className="w-auto px-6 py-4 text-lg bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center font-bold h-auto"
              >

                I Understand
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 py-4 text-lg bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center font-bold h-auto"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
