"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const FixedHeader = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  const handleBannerClick = () => {
    setTapCount((prev) => {
      const nextTapCount = prev + 1;

      if (nextTapCount === 3) {
        localStorage.removeItem('hasSeenOnboarding');
        sessionStorage.removeItem('isPremium');
        storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, false);
        navigate('/onboarding');
      }

      return nextTapCount;
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Status Bar Background - matches the brand red */}
      <div className="h-[env(safe-area-inset-top)] bg-red-600 w-full" />
      
      {/* Main Header Content - Reduced height from 106px to 80px */}
      <div className="bg-gray-100 dark:bg-gray-900 flex justify-center items-center h-[80px] relative px-4">
        <Link to="/" className="block w-full max-w-max" onClick={handleBannerClick}>
          <h1 className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight shadow-sm whitespace-nowrap text-center w-full">
            SIMPLE ALLERGY ALERT
          </h1>
        </Link>
      </div>
    </div>
  );
};

export default FixedHeader;