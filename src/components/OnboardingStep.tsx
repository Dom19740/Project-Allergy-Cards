"use client";

import React from 'react';

interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, image }) => {
  return (
    <div className="flex flex-col items-center text-center h-full max-h-full overflow-hidden">
      {image && (
        <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden mb-6">
          <img 
            src={image} 
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl shadow-md"
          />
        </div>
      )}
      
      <div className="shrink-0 px-4 pb-2">
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};

export default OnboardingStep;