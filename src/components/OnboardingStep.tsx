"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import StepHeader from './StepHeader';

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ title, description, icon, image }) => {
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <StepHeader 
        title={title}
        description={description}
        icon={icon}
      />

      {image && (
        <div className="mt-8 w-full max-w-xs aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;