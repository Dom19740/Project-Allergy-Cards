"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      {/* Main Content Wrapper - takes remaining height, adds padding for header */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        {/* Top Section: Flexible content area, scrollable */}
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="w-72 h-72 sm:w-96 sm:h-96 md:w-[30rem] md:h-[30rem] object-contain" 
            />
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10">
              Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely when traveling or dining out.
            </p>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10">
               Plus a translated emergency alert card for urgent situations
            </p>
            
            {/* Saved Cards Section */}
            <SavedCardsList />
          </div>
        </div>

        {/* Bottom Section: Fixed height button area */}
        <div className="w-full flex flex-col justify-center items-center mt-8 mb-[50px] gap-4">

          <Button 
            asChild 
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            <Link to="/select-allergens">Get Started</Link>
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          © 2026 <a href="https://dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-200">dpb creative</a>. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;