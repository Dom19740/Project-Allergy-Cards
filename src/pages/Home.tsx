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

  // Calculate scale: shrinks from 1 to 0.4
  const scale = Math.max(0.4, 1 - scrollY / 300);
  // Calculate opacity: fades out completely by 250px of scroll
  const opacity = Math.max(0, 1 - scrollY / 250);
  // Calculate height: shrinks from 384px to 0 to "pull" the text up
  const currentHeight = Math.max(0, 384 * (1 - scrollY / 300));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[106px]">
        <div className="flex flex-col items-center text-center">
          {/* Logo Container: Relative positioning ensures no overlap with text below */}
          <div 
            className="flex justify-center items-center w-full overflow-hidden transition-all duration-75 ease-out"
            style={{ 
              height: `${currentHeight}px`,
              opacity: opacity,
              visibility: opacity === 0 ? 'hidden' : 'visible'
            }}
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