"use client";

import React from 'react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

interface AllergyCardContentProps {
  allergens: any;
  language: string;
  alertMessages: any;
}

const AllergyCardContent: React.FC<AllergyCardContentProps> = ({ allergens, language, alertMessages }) => {
  const standardIds = allergens.ids || [];
  const standardAllergens = ALLERGEN_OPTIONS.filter(opt => standardIds.includes(opt.id));
  const customAllergens = allergens.custom || [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-red-600 w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-red-600 uppercase tracking-tight">
          {alertMessages.iAmAllergicTo}
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {standardAllergens.map(a => (
          <div key={a.id} className="flex flex-col items-center">
            <img src={a.image} alt={a.name} className="w-12 h-12 object-contain" />
            <span className="text-[10px] font-bold mt-1 text-center dark:text-gray-200">{a.name}</span>
          </div>
        ))}
        {customAllergens.map((a: string) => (
          <div key={a} className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 rounded p-2">
            <span className="text-[10px] font-bold text-center dark:text-gray-200">{a}</span>
          </div>
        ))}
      </div>

      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-700 dark:text-red-400 font-bold text-sm">
          {alertMessages.theyMakeMeSick}
        </p>
      </div>
    </div>
  );
};

export default AllergyCardContent;