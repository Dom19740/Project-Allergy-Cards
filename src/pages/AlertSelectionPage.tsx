"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, MessageSquare, AlertTriangle } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { CustomMessages } from '@/lib/types';

const AlertSelectionPage = () => {
  const navigate = useNavigate();
  const [iAmAllergicTo, setIAmAllergicTo] = useState("I can not eat:");
  const [theyMakeMeSick, setTheyMakeMeSick] = useState("They make me very sick and I could die");

  useEffect(() => {
    const loadMessages = async () => {
      const storedMessages = await storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      if (storedMessages) {
        setIAmAllergicTo(storedMessages.iAmAllergicTo || "I can not eat:");
        setTheyMakeMeSick(storedMessages.theyMakeMeSick || "They make me very sick and I could die");
      }
    };
    loadMessages();
  }, []);

  const handleContinue = async () => {
    await storage.set(STORAGE_KEYS.CUSTOM_MESSAGES, {
      iAmAllergicTo,
      theyMakeMeSick
    });
    
    const languageCode = await storage.get<string>(STORAGE_KEYS.SELECTED_LANGUAGE);
    navigate(`/alert/${languageCode}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[80px]">
        <div className="flex-grow pt-0">
          <StepHeader 
            title="Customize Alert"
            description="Personalize the message that will appear on your card."
          />
          
          <div className="space-y-6 mt-8 px-2">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                <MessageSquare className="w-4 h-4 mr-2 text-red-600" />
                Intro Message
              </label>
              <Textarea
                value={iAmAllergicTo}
                onChange={(e) => setIAmAllergicTo(e.target.value)}
                placeholder="e.g., I am allergic to:"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl min-h-[80px] text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                Warning Message
              </label>
              <Textarea
                value={theyMakeMeSick}
                onChange={(e) => setTheyMakeMeSick(e.target.value)}
                placeholder="e.g., They make me very sick."
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl min-h-[100px] text-base resize-none"
              />
            </div>
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
            Preview Card
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertSelectionPage;