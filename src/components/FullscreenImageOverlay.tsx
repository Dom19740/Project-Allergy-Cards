"use client";

import React from 'react';
import { Utensils } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

interface FullscreenImageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allergensWithImages: typeof ALLERGEN_OPTIONS;
  imageGridStyle: { gridTemplateColumns: string; gridTemplateRows: string };
}

const FullscreenImageOverlay: React.FC<FullscreenImageOverlayProps> = ({
  isOpen,
  onClose,
  allergensWithImages,
  imageGridStyle
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-0 m-0"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full aspect-square max-w-full max-h-full flex items-center justify-center">
          {allergensWithImages.length > 0 ? (
            <div className="absolute inset-0 grid gap-4 items-center justify-items-center z-0 p-8" style={imageGridStyle}>
              {allergensWithImages.map((allergen) => (
                <div key={allergen.id} className="w-full h-full flex items-center justify-center">
                  <img src={allergen.image} alt={allergen.name} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <Utensils className="w-1/2 h-1/2 text-red-600 opacity-20" />
            </div>
          )}
          <img 
            src="/noentry.png" 
            alt="No entry" 
            className="absolute inset-0 w-full h-full object-contain z-10 opacity-90 pointer-events-none" 
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageOverlay;