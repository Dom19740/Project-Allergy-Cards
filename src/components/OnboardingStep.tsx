"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import SafetyDisclaimer from '@/components/SafetyDisclaimer';
import InstallChoiceStep from '@/components/InstallChoiceStep';
import PremiumOfferStep from '@/components/PremiumOfferStep';
import { useShrinkToFit } from '@/hooks/useShrinkToFit';

interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string;
  returnTo?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, image, returnTo }) => {
  const hasDisclaimer = title === "Safety First";
  const hasInstallChoice = title === "Keep Your Cards Safe";
  const hasPremiumOffer = title === "Unlock Premium";
  const hasCustomContent = hasDisclaimer || hasInstallChoice || hasPremiumOffer;
  const { containerRef, contentRef } = useShrinkToFit<HTMLDivElement, HTMLDivElement>();

  return (
    <div className="flex flex-col items-center text-center h-full max-h-full overflow-hidden">
      {hasCustomContent ? (
        <div ref={containerRef} className="flex-1 w-full min-h-0 flex flex-col items-center justify-start overflow-y-auto">
          <div ref={contentRef} className="w-full flex flex-col items-center">
            <div className="w-full max-w-md px-4">
              {hasDisclaimer ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full cursor-default active:opacity-70 transition-opacity">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold">Safety Disclaimer</h2>
                  </div>
                  <div className="text-base md:text-lg leading-relaxed">
                    <SafetyDisclaimer />
                  </div>
                </>
              ) : hasInstallChoice ? (
                <InstallChoiceStep />
              ) : (
                <PremiumOfferStep returnTo={returnTo} />
              )}
            </div>
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

      {hasCustomContent ? null : (
        <div className="shrink-0 px-4 pb-4 min-h-[120px] flex flex-col justify-start">
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;
