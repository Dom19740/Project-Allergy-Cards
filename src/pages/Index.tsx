"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Allergy Card Generator</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        Create a digital allergy card to communicate your dietary needs safely while traveling.
      </p>
      <Button onClick={() => navigate('/allergen-selection')} size="lg" className="bg-red-600 hover:bg-red-700 text-white">
        Get Started
      </Button>
    </div>
  );
};

export default Index;