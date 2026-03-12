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
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-[calc(106px+env(safe-area-inset-top)+10px)] pb-[env(safe-area-inset-bottom)] min-h-0">
        
        {/* Top Section */}
        <div className="flex-1 flex flex-col items-center text-center min-h-0">
          
          {/* Minimized Image Container */}
          <div className="flex-[0.3] w-full flex items-center justify-center min-h-0 p-2">
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="max-h-full max-w-[160px] w-auto h-auto object-contain" 
            />
          </div>
          
          {/* Text and Saved Cards Section */}
          <div className="flex-1 flex flex-col justify-around w-full py-2 min-h-0">
            <div className="space-y-2">
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-relaxed">
                Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely.
              </p>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-md mx-auto px-6 leading-relaxed">
                 Plus a translated emergency alert card.
              </p>
            </div>
            
            {/* Saved Cards Section */}
            <div className="w-full">
              <SavedCardsList />
            </div>
          </div>
        </div>

        {/* Bottom Section: Button and Footer */}
        <div className="flex-shrink-0 w-full flex flex-col justify-center items-center py-4 gap-3">
          <Button 
            asChild 
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            <Link to="/onboarding">Get Started</Link>
          </Button>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
            © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;