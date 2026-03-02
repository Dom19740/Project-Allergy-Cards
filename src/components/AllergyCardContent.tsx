"use client";

import React from 'react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

interface AllergyCardContentProps {
  allergens: {
    ids: string[];
    custom: string[];
  };
  language: string;
  alertMessages: {
    iAmAllergicTo: string;
    theyMakeMeSick: string;
  };
}

const AllergyCardContent: React.FC<AllergyCardContentProps> = ({ allergens, language, alertMessages }) => {
  const standardAllergens = ALLERGEN_OPTIONS.filter(opt => allergens.ids.includes(opt.id));
  const customAllergens = allergens.custom || [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-red-600 w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-red-600 uppercase tracking-tight leading-tight">
          {alertMessages.iAmAllergicTo}
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        {standardAllergens.map(a => (
          <div key={a.id} className="flex flex-col items-center space-y-1">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center p-2 border border-gray-100 dark:border-gray-600">
              <img src={a.image} alt={a.name} className="w-10 h-10 object-contain" />
            </div>
            <span className="text-[10px] font-bold text-center uppercase text-gray-700 dark:text-gray-300">
              {a.name}
            </span>
          </div>
        ))}
        {customAllergens.map((a) => (
          <div key={a} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[80px]">
            <span className="text-xs font-bold text-center text-gray-600 dark:text-gray-400 uppercase">
              {a}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
        <p className="text-red-700 dark:text-red-400 font-extrabold text-base leading-snug">
          {alertMessages.theyMakeMeSick}
        </p>
      </div>
    </div>
  );
};

export default AllergyCardContent;