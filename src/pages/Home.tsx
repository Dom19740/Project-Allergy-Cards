"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';

const Home = () => {
  const navigate = useNavigate();
  const [hasCard, setHasCard] = useState(false);

  // Check if a card exists in localStorage
  useEffect(() => {
    const savedCard = localStorage.getItem('allergyCard');
    if (savedCard) {
      setHasCard(true);
    }
  }, []);

  const handleShowCard = () => {
    navigate('/alert');
  };

  const handleGetStarted = () => {
    navigate('/select-allergens');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400 mb-6">
              Allergy Card Builder
            </h1>
            
            <div className="flex items-center space-x-4">
              {hasCard ? (
                <Button
                  onClick={handleShowCard}
                  className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
                >
                  Show Card
                </Button>
              ) : (
                <Button
                  onClick={handleGetStarted}
                  className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;