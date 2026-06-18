"use client";

import React from 'react';
import FixedHeader from '@/components/FixedHeader';
import { Button } from '@/components/ui/button'; // Import Button component

const PageTemplate = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      {/* Main Content Wrapper - takes remaining height, adds padding for header */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        {/* Top Section: Flexible content area, scrollable */}
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200">
              Welcome to your new Page Template!
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              This is the top section for your page content. It will grow to fill available space and scroll if content overflows.
            </p>
            {/* Add more content here */}
          </div>
        </div>

        {/* Bottom Section: Fixed height button area */}
        <div className="w-full flex justify-center items-center mt-8 mb-[50px]">
          <Button variant="primary" className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 w-[280px]">
            Button Placeholder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;