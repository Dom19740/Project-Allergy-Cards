"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import SafetyDisclaimer from '@/components/SafetyDisclaimer';

interface StepHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const StepHeader: React.FC<StepHeaderProps> = ({ title, description, icon: Icon }) => {
  const hasDisclaimer = title === "Safety First";

  return (
    <div className="w-full px-4 flex flex-col items-center text-center space-y-1">
      {Icon && (
        <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-full shrink-0">
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
        </div>
      )}
      
      <div className="space-y-0.5 w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
          {title}
        </h2>
        <div className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-snug">
          {hasDisclaimer ? <SafetyDisclaimer /> : <p className="break-words">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default StepHeader;
