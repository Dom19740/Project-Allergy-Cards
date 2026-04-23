"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';

const SelectLanguages = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Select Languages</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Choose the languages you want your card translated into.
        </p>
        <Button 
          onClick={() => navigate('/card-preview')}
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white"
        >
          Next: Preview Card
        </Button>
      </div>
    </div>
  );
};

export default SelectLanguages;