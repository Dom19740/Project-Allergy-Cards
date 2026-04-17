"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useBilling } from '@/hooks/useBilling';

const SelectAlertPage = () => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [iAmAllergicTo, setIAmAllergicTo] = useState("Please, I can not eat:");
  const [theyMakeMeSick, setTheyMakeMeSick] = useState(
    "It will make me seriously ill and I can die",
  );

  useEffect(() => {
    const loadMessages = async () => {
      const savedAlert = await storage.get<any>(STORAGE_KEYS.CUSTOM_MESSAGES);
      if (savedAlert) {
        if (savedAlert.iAmAllergicTo) setIAmAllergicTo(savedAlert.iAmAllergicTo);
        if (savedAlert.theyMakeMeSick) setTheyMakeMeSick(savedAlert.theyMakeMeSick);
      }
    };
    loadMessages();
  }, []);

  const handleContinue = async () => {
    await storage.remove(STORAGE_KEYS.SESSION_TRANSLATIONS);
    
    await storage.set(
      STORAGE_KEYS.CUSTOM_MESSAGES,
      {
        iAmAllergicTo,
        theyMakeMeSick,
      },
    );
    navigate('/select-language');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />

      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <div className="flex-grow pt-2">
          <StepHeader 
            title="Customise Alert"
            description="Personalise the warning messages that will appear on the card."
          />

          <div className="w-full space-y-6 text-left pt-8 pb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <Label
                  htmlFor="allergic-to"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Primary Warning
                </Label>
              </div>
              <textarea
                id="allergic-to"
                value={iAmAllergicTo}
                onChange={(e) => setIAmAllergicTo(e.target.value)}
                disabled={!isPremium}
                placeholder="e.g. Please, I can not eat:"
                className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y disabled:opacity-70"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <Label
                  htmlFor="make-me-sick"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Secondary Warning
                </Label>
              </div>
              <textarea
                id="make-me-sick"
                value={theyMakeMeSick}
                onChange={(e) => setTheyMakeMeSick(e.target.value)}
                disabled={!isPremium}
                placeholder="e.g. It will make me seriously ill..."
                className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y disabled:opacity-70"
              />
            </div>
            
            {!isPremium && (
              <button 
                onClick={() => navigate('/')}
                className="mt-4 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
              >
                <Crown className="h-4 w-4" />
                Unlock Custom Alerts
              </button>
            )}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] pt-12 gap-4 shrink-0">
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