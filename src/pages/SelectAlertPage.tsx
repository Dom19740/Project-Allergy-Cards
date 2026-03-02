"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
        console.error('Failed to parse custom alert messages', e);
      }
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem('customAlertMessages', JSON.stringify({ iAmAllergicTo, theyMakeMeSick }));
    navigate('/select-language');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[126px]">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Customise Alert</h2>
            <div className="w-full space-y-6 text-left">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500 ml-[10px]">Primary Warning</Label>
                <textarea
                  value={iAmAllergicTo}
                  onChange={(e) => setIAmAllergicTo(e.target.value)}
                  className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg min-h-[80px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500 ml-[10px]">Secondary Warning</Label>
                <textarea
                  value={theyMakeMeSick}
                  onChange={(e) => setTheyMakeMeSick(e.target.value)}
                  className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg min-h-[80px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-8 mb-[50px] gap-4">
          <Button onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 w-[280px]">Back</Button>
          <Button onClick={handleContinue} className="bg-red-600 text-white w-[280px]">Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAlertPage;