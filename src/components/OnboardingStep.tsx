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
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
        <Icon className="w-16 h-16 text-red-600" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {image && (
        <div className="mt-4 w-full max-w-xs aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
    </div>
  );
};

export default OnboardingStep;