"use client";

import React from 'react';
import { Info } from 'lucide-react';
import SafetyDisclaimer from '@/components/SafetyDisclaimer';

interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, image }) => {
  const hasDisclaimer = title === "Safety First";

  return (
    <div className="flex flex-col items-center text-center h-full max-h-full overflow-hidden">
      {hasDisclaimer ? (
        <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full mb-4 cursor-default active:opacity-70 transition-opacity">
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <div className="w-full max-w-md overflow-y-auto px-4">
            <h2 className="text-xl font-bold mb-4">Safety Disclaimer</h2>
            <SafetyDisclaimer />
          </div>
        </div>
      ) : image ? (
        <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden mb-6">
          <img
            src={image}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl shadow-md"
          />
        </div>
      ) : null}
      
      <div className="shrink-0 px-4 pb-4 min-h-[120px] flex flex-col justify-start">
        {hasDisclaimer ? null : <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">{description}</p>}
      </div>
    </div>
  );
};

export default OnboardingStep;
