"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StepHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const StepHeader: React.FC<StepHeaderProps> = ({ title, description, icon: Icon }) => {
  const warningText = "If in doubt, do not eat.";
  const hasWarning = description.includes(warningText);
  const mainText = hasWarning ? description.replace(warningText, "").trim() : description;

  return (
    <div className="flex flex-col items-center text-center space-y-6 w-full">
      {Icon && (
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full shrink-0">
          <Icon className="w-16 h-16 text-red-600" />
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <div className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          <p>{mainText}</p>
          {hasWarning && (
            <p className="mt-2 font-bold text-red-600 dark:text-red-500">
              {warningText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepHeader;