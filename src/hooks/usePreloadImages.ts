"use client";

import { useEffect } from 'react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

const IMAGES_TO_PRELOAD = [
  '/logo_main.png',
  '/noentry.png',
  ...ALLERGEN_OPTIONS.map(option => option.image)
];

export const usePreloadImages = () => {
  useEffect(() => {
    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
};