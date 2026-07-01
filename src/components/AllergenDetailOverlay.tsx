"use client";

import React from 'react';
import { Utensils } from 'lucide-react';

interface AllergenDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  translatedName: string;
  englishName: string;
  image?: string;
}

const AllergenDetailOverlay: React.FC<AllergenDetailOverlayProps> = ({
  isOpen,
  onClose,
  translatedName,
  englishName,
  image,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-3 sm:gap-4 p-6"
      onClick={onClose}
    >
      <span className="bg-red-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-full text-xl sm:text-2xl md:text-3xl font-normal uppercase">
        {translatedName}
      </span>
      <span className="inline-flex items-center bg-white rounded-full px-4 py-1.5 border border-gray-200 shadow-md text-gray-600 text-sm sm:text-base font-light uppercase">
        {englishName}
      </span>
      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
        {image ? (
          <img src={image} alt={englishName} className="max-w-full max-h-full object-contain" />
        ) : (
          <Utensils className="w-1/2 h-1/2 text-red-600 opacity-20" />
        )}
      </div>
    </div>
  );
};

export default AllergenDetailOverlay;
