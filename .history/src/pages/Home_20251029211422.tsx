"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader'; // Import FixedHeader

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center pt-20"> {/* Added pt-20 */}
      <FixedHeader /> {/* Use the FixedHeader component */}
      <img 
        src="/logo_main.png" 
        alt="App Logo" 
        className="w-84 h-84 object-contain mb-8" 
      />
      <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-prose">
        Create a personalized allergy alert card in multiple languages to communicate your dietary restrictions easily and safely when traveling or dining out.
      </p>
      <Button 
        asChild 
        className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
      >
        <Link to="/select-allergens">Get Started</Link>
      </Button>
    </div>
  );
};

export default Home;