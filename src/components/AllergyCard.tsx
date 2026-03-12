"use client";

import React from 'react';
import { ALLERGENS } from '@/constants/allergens';

interface AllergyCardProps {
  languageCode: string;
  selectedAllergens: string[];
  customAlert?: string;
}

const AllergyCard: React.FC<AllergyCardProps> = ({
  languageCode,
  selectedAllergens,
  customAlert
}) => {
  const allergens = ALLERGENS.filter(a => selectedAllergens.includes(a.id));

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-red-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wider">Allergy Alert</h2>
        <p className="text-sm opacity-90 mt-1">Language: {languageCode.toUpperCase()}</p>
      </div>
      
      <div className="p-6 space-y-6">
        {customAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-900 font-medium leading-relaxed">
              {customAlert}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {allergens.map((allergen) => (
            <div 
              key={allergen.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <span className="text-2xl">{allergen.icon}</span>
              <span className="font-semibold text-gray-700">{allergen.name}</span>
            </div>
          ))}
        </div>

        {allergens.length === 0 && !customAlert && (
          <p className="text-center text-gray-400 italic py-8">
            No allergens selected
          </p>
        )}
      </div>
    </div>
  );
};

export default AllergyCard;