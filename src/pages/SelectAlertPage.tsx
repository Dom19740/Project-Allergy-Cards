"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FixedHeader from '@/components/FixedHeader';

const SelectAlertPage = () => {
  const navigate = useNavigate();
  const [iAmAllergicTo, setIAmAllergicTo] = useState("I can not eat:");
  const [theyMakeMeSick, setTheyMakeMeSick] = useState("They make me very sick and I could die");

  useEffect(() => {
    const savedAlert = localStorage.getItem('customAlertMessages');
    if (savedAlert) {
      try {
        const parsed = JSON.parse(savedAlert);
        if (parsed.iAmAllergicTo) setIAmAllergicTo(parsed.iAmAllergicTo);
        if (parsed.theyMakeMeSick) setTheyMakeMeSick(parsed.theyMakeMeSick);
      } catch (e) {
        console.error("Failed to parse custom alert messages", e);
      }
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem('customAlertMessages', JSON.stringify({
      iAmAllergicTo,
      theyMakeMeSick
    })); 
    navigate('/select-language');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200">
                Customise Alert
              </h2>
            </div>
            <div className="w-full space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="allergic-to" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Primary Warning
                </Label>
                <Input
                  id="allergic-to"
                  value={iAmAllergicTo}
                  onChange={(e) => setIAmAllergicTo(e.target.value)}
                  placeholder="e.g. I can not eat:"
                  className="w-full p-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 h-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make-me-sick" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Secondary Warning
                </Label>
                <Input
                  id="make-me-sick"
                  value={theyMakeMeSick}
                  onChange={(e) => setTheyMakeMeSick(e.target.value)}
                  placeholder="e.g. They make me very sick..."
                  className="w-full p-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 h-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-8 mb-[50px] gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-gray-200 text-gray-800 hover:bg-gray-300 w-[280px]"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="py-3 text-lg md:text-xl h-auto transition-all duration-200 ease-in-out hover:scale-105 bg-red-600 text-white hover:bg-red-700 w-[280px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAlertPage;