"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';

const SelectLanguages = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24">
        <h1 className="text-2xl font-bold mb-4">Select Languages</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Choose the languages you want your card translated into.</p>
        
        <Button onClick={() => navigate('/card-preview')} className="w-full bg-red-600 hover:bg-red-700 text-white">
          Next: Preview Card
        </Button>
      </div>
    </div>
  );
};

export default SelectLanguages;