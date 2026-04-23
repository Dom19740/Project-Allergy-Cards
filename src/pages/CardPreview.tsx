"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FixedHeader from '@/components/FixedHeader';

const CardPreview = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24">
        <h1 className="text-2xl font-bold mb-4">Card Preview</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <p className="text-center italic">Your allergy card preview will appear here.</p>
        </div>
        
        <Button onClick={() => navigate('/')} className="w-full bg-red-600 hover:bg-red-700 text-white">
          Save Card
        </Button>
      </div>
    </div>
  );
};

export default CardPreview;