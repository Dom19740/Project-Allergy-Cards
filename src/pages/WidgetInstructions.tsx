"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ChevronLeft, Plus, Share, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepHeader from '@/components/StepHeader';
import FixedHeader from '@/components/FixedHeader';

const WidgetInstructions = () => {
  const navigate = useNavigate();

  const instructions = [
    {
      icon: Share,
      text: "Tap the 'Share' button in your browser"
    },
    {
      icon: Plus,
      text: "Scroll down and tap 'Add to Home Screen'"
    },
    {
      icon: Layout,
      text: "Tap 'Add' in the top right corner"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex-grow flex flex-col items-center px-6 pt-[calc(80px+env(safe-area-inset-top)+20px)] pb-8">
        <div className="w-full max-w-md space-y-8">
          <StepHeader 
            title="Add a Widget"
            description="Follow these steps to add Simple Allergy Alert to your home screen for instant access."
            icon={Smartphone}
          />

          <div className="space-y-4">
            {instructions.map((step, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button 
              onClick={() => navigate(-1)}
              className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/10 transition-all active:scale-[0.98]"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetInstructions;