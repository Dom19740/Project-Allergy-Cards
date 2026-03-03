"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';

const SelectAlertPage = () => {
  const navigate = useNavigate();
  const [iAmAllergicTo, setIAmAllergicTo] = useState("I can not eat:");
  const [theyMakeMeSick, setTheyMakeMeSick] = useState(
    "They make me very sick and I could die",
  );

  useEffect(() => {
    const savedAlert = localStorage.getItem('customAlertMessages');
    if (savedAlert) {
      try {
        const parsed = JSON.parse(savedAlert);
        if (parsed.iAmAllergicTo) setIAmAllergicTo(parsed.iAmAllergicTo);
        if (parsed.theyMakeMeSick) setTheyMakeMeSick(parsed.theyMakeMeSick);
      } catch (e) {
        console.error('Failed to parse custom alert messages', e);
      }
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem(
      'customAlertMessages',
      JSON.stringify({
        iAmAllergicTo,
        theyMakeMeSick,
      }),
    );
    navigate('/select-language');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <FixedHeader />

      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px] overflow-hidden">
        <div className="flex-grow overflow-y-auto pt-8">
          <StepHeader 
            title="Customise Alert"
            description="Personalise the warning messages that will appear on your card."
          />

          <div className="w-full space-y-6 text-left pt-8 pb-4">
            <div className="space-y-2">
              <Label
                htmlFor="allergic-to"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2"
              >
                Primary Warning
              </Label>
              <textarea
                id="allergic-to"
                value={iAmAllergicTo}
                onChange={(e) => setIAmAllergicTo(e.target.value)}
                placeholder="e.g. I can not eat:"
                className="w-full mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="make-me-sick"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2"
              >
                Secondary Warning
              </Label>
              <textarea
                id="make-me-sick"
                value={theyMakeMeSick}
                onChange={(e) => setTheyMakeMeSick(e.target.value)}
                placeholder="e.g. They make me very sick..."
                className="w-full mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y"
              />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="py-3 px-8 text-lg h-auto bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAlertPage;