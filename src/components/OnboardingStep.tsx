"use client";

import React from 'react';

interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, image }) => {
  // Split the description to handle the specific warning text
  const warningText = "If in doubt, do not eat.";
  const parts = description.split(warningText);
  const hasWarning = parts.length > 1;

  return (
    <div className="flex flex-col items-center text-center h-full max-h-full overflow-hidden">
      {image && (
        <div className="w-full flex-[0_0_70%] min-h-0 flex items-center justify-center overflow-hidden mb-6">
          <div className="h-full aspect-[9/19] flex items-center justify-center">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-contain rounded-3xl shadow-md"
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col justify-start px-4 pb-4 overflow-hidden">
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
          {parts[0]}
          {hasWarning && (
            <span className="block mt-2 text-red-600 font-bold">
              {warningText}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default OnboardingStep;