"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';

const Home = () => {
  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      
      {/* Main Content Wrapper - accounts for fixed header height */}
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(106px+env(safe-area-inset-top))] overflow-hidden">
        
        {/* Flexible content area */}
        <div className="flex-1 flex flex-col items-center text-center space-y-4 py-4 min-h-0 overflow-hidden">
          
          {/* Image container that shrinks to fit available space */}
          <div className="flex-1 min-h-0 flex items-center justify-center w-full">
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
          
          {/* Text section */}
          <div className="shrink-0 space-y-2">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-md px-4 leading-tight">
              Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely.
            </p>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-md px-4 leading-tight">
               Plus a translated emergency alert card for urgent situations.
            </p>
          </div>
          
          {/* Saved Cards Section - Internally scrollable if needed, but doesn't cause page scroll */}
          <div className="flex-1 w-full overflow-y-auto min-h-0">
            <SavedCardsList />
          </div>
        </div>

        {/* Bottom Section: Fixed at bottom */}
        <div className="w-full flex flex-col justify-center items-center py-4 gap-3 shrink-0 pb-[calc(16px+env(safe-area-inset-bottom,24px))]">
          <Button 
            asChild 
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            <Link to="/onboarding">Get Started</Link>
          </Button>

          <p className="text-[10px] text-gray-500 dark:text-gray-400">
          © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;