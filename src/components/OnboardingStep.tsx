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
        <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden mb-6">
          <img 
            src={image} 
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl shadow-md"
          />
        </div>
      )}
      
      {/* Fixed minimum height container to keep image position constant across steps */}
      <div className="shrink-0 px-4 pb-4 min-h-[120px] flex flex-col justify-start">
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