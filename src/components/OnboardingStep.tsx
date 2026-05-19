"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, icon: Icon, image }) => {
  return (
    <div className="flex flex-col items-center text-center h-full max-h-full overflow-hidden">
      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl mb-4 shrink-0">
        <Icon className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 shrink-0">
        {title}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6 shrink-0 px-2">
        {description}
      </p>

      {image && (
        <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;