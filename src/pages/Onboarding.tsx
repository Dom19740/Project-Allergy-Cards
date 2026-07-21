"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import OnboardingStep from '@/components/OnboardingStep';

const ONBOARDING_STEPS = [
  {
    title: "Safety First",
    description: "This app is not a medical device. It provides translated allergy alerts for convenience. Some translations are machine-generated and may contain errors. Do not rely on this app as your sole means of communicating a life-threatening allergy. Always carry your prescribed medication. By using this app you agree to our Terms & Conditions and Privacy Policy. If in doubt, do no eat.",
    image: "/images/screenshot_1.png"
  },
  {
    title: "Keep Your Cards Safe",
    description: "Cards saved in your browser can be lost if you clear browsing data. Install the app to keep them safe."
  },
  {
    title: "Intro",
    description: "Create personalized allergy alerts in over 100 languages to communicate your dietary restrictions easily and safely.",
    image: "/images/screenshot_1.png"
  },
  {
    title: "Select Your Allergens",
    description: "Choose from the EU standard allergen list or add your own custom allergens. Customise your allergy alert warnings.",
    image: "/images/screenshot_2.png"
  },
  {
    title: "Choose a Language",
    description: "Select from over 100 languages to translate your allergy alert instantly.",
    image: "/images/screenshot_3.png"
  },
  {
    title: "Share & Save",
    description: "Save up to 10 cards in the app for quick access. Download your card as an image, share it with others.",
    image: "/images/screenshot_4_alternate.png"
  },
  {
    title: "Emergency Ready",
    description: "Create and save your Emergency Card to quickly communicate your need for medical attention. Quick dial local emergency services.",
    image: "/images/screenshot_5_alternate.png"
  },
  {
    title: "Add a Widget",
    description: "Add the widget to your home screen for instant offline access to your saved cards and one-tap emergency alert (Android only).",
    image: "/images/screenshot_6.png"
  },
  {
    title: "Know Your Card",
    description: "Open the menu on any card to understand all the features.",
    image: "/images/screenshot_7.png"
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

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      emblaApi?.scrollNext();
    } else {
      navigate('/premium-onboarding');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      emblaApi?.scrollPrev();
    }
  };

  const handleUnderstand = () => {
    emblaApi?.scrollNext();
  };

  const handleSkip = () => {
    navigate('/premium-onboarding');
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

        <div className="w-full flex flex-col items-center mt-auto mb-[calc(12px+env(safe-area-inset-bottom))] space-y-6 shrink-0">
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

          {currentStep === 0 ? (
            <div key="row-single" className="w-full flex items-center justify-center">
              <Button
                key="understand"
                variant="primary"
                onClick={handleUnderstand}
                className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95"
              >
                I Understand
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className={`w-full flex items-center gap-4 ${currentStep === 1 ? 'justify-center' : 'justify-between'}`}
            >
              <AnimatePresence mode="popLayout">
                {currentStep !== 1 && (
                  <motion.div
                    key={currentStep === 2 ? 'skip' : 'back'}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      onClick={currentStep === 2 ? handleSkip : handleBack}
                      className="flex items-center justify-center py-3 px-8 h-auto min-w-[140px] rounded-xl bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      {currentStep === 2 ? 'Skip' : 'Back'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <Button
                  key="continue"
                  variant="primary"
                  onClick={handleNext}
                  className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center"
                >
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
