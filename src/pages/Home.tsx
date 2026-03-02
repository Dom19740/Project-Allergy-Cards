"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';
import SavedCardsList from '@/components/SavedCardsList';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate scale factor: starts at 1, shrinks to 0.4 over 300px of scroll
  const scale = Math.max(0.4, 1 - scrollY / 300);
  // Calculate height: starts at 384px (w-96), shrinks proportionally
  const currentHeight = Math.max(120, 384 * scale);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[106px]">
        <div className="flex flex-col items-center text-center">
          {/* Sticky Logo Container that shrinks */}
          <div 
            className="sticky top-[106px] z-10 flex justify-center items-center w-full transition-all duration-75 ease-out overflow-hidden"
            style={{ height: `${currentHeight}px` }}
          >
            <img 
              src="/logo_main.png" 
              alt="App Logo" 
              className="object-contain transition-transform duration-75 ease-out"
              style={{ 
                height: '100%',
                transform: `scale(${scale})`,
                transformOrigin: 'center center'
              }}
            />
          </div>

          <div className="space-y-8 mt-4">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10">
              Create a personalized allergy alert in multiple languages to communicate your dietary restrictions easily and safely when traveling or dining out. Plus generate an emergency alert card for urgent situations
            </p>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-md px-10">
               Plus a translated emergency alert card for urgent situations
            </p>
            
            {/* Saved Cards Section */}
            <SavedCardsList />
          </div>
        </div>

        {/* Bottom Section: Fixed height button area */}
        <div className="w-full flex flex-col justify-center items-center mt-12 mb-[50px] gap-4">
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