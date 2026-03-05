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
      
      {/* Main Content Wrapper - takes remaining height, adds padding for header */}
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(106px+env(safe-area-inset-top)+20px)] pb-[env(safe-area-inset-bottom)]">
        
        {/* Top Section: Flexible content area that shrinks the image to fit */}
        <div className="flex-1 flex flex-col items-center text-center min-h-0 space-y-4">
          <div className="flex-1 flex items-center justify-center min-h-0 w-full">
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
          
          <div className="flex-shrink-0 space-y-4 pb-4">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10 leading-relaxed">
              Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely when traveling or dining out.
            </p>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10 leading-relaxed">
               Plus a translated emergency alert card for urgent situations
            </p>
            
            {/* Saved Cards Section - scrollable if it grows too large */}
            <div className="max-h-[150px] overflow-y-auto">
              <SavedCardsList />
            </div>
          </div>
        </div>

        {/* Bottom Section: Fixed height button area with extra bottom padding for mobile nav */}
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center mt-4 mb-8 gap-4">
          <Button 
            asChild 
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            <Link to="/onboarding">Get Started</Link>
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;