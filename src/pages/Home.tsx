"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';

const Home = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />
      
      {/* Main Content Wrapper - fixed height, no scrolling on container */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(126px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]">
        
        {/* Top Section: Flexible content area, scrollable only if content exceeds space */}
        <div className="flex-grow flex flex-col justify-center overflow-y-auto py-2">
          <div className="flex flex-col items-center text-center space-y-4">
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="w-48 h-48 sm:w-64 sm:h-64 object-contain" 
            />
            <div className="space-y-2">
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-md px-6">
                Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely when traveling or dining out.
              </p>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-md px-6">
                 Plus a translated emergency alert card for urgent situations
              </p>
            </div>
            
            {/* Saved Cards Section */}
            <SavedCardsList />
          </div>
        </div>

        {/* Bottom Section: Positioned at the very bottom above nav bar */}
        <div className="w-full flex flex-col justify-center items-center mt-auto pt-4 pb-2 gap-4">
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