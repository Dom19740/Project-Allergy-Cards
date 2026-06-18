"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';

const SelectAllergens = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Select Your Allergens</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Choose the allergens you want to include on your card.
        </p>
        <Button 
          onClick={() => navigate('/select-languages')}
          variant="primary"
          className="w-full max-w-xs"
        >
          Next: Select Languages
        </Button>
      </div>
    </div>
  );
};

export default SelectAllergens;