"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';

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
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />

      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Standardized Icon Header */}
            <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
              <AlertTriangle className="w-16 h-16 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                Customise Alert
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Personalise the warning messages that will appear on your card.
              </p>
            </div>

            <div className="w-full space-y-6 text-left pt-4">
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
                  className="w-full px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y"
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
                  className="w-full px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-8 mb-[50px] gap-4 shrink-0">
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