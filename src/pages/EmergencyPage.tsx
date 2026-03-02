"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, Phone } from 'lucide-react';
import { translateText } from '@/lib/translator';
import FixedHeader from '@/components/FixedHeader';
import { Button } from '@/components/ui/button';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);
  const [translatedText, setTranslatedText] = useState({
    attention: "ATTENTION",
    emergency: "I am having a medical emergency.",
    needHelp: "I need help immediately.",
    callServices: "Please call emergency services.",
    dial112: "DIAL 112"
  });

  useEffect(() => {
    const translateEmergencyContent = async () => {
      if (!langCode || langCode === 'en') {
        setIsTranslating(false);
        return;
      }

      try {
        const [attention, emergency, needHelp, callServices, dial112] = await Promise.all([
          translateText("ATTENTION", langCode),
          translateText("I am having a medical emergency.", langCode),
          translateText("I need help immediately.", langCode),
          translateText("Please call emergency services.", langCode),
          translateText("DIAL 112", langCode)
        ]);

        setTranslatedText({
          attention,
          emergency,
          needHelp,
          callServices,
          dial112
        });
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translateEmergencyContent();
  }, [langCode]);

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-xl font-medium text-gray-600">Preparing emergency message...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-6 pt-[120px] pb-10">
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
          <div className="bg-red-600 p-6 rounded-full shadow-lg">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
          
          <div className="space-y-6 bg-red-50 p-8 rounded-3xl border-2 border-red-200 w-full">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-red-600 border-b-4 border-red-600 pb-4">
              {translatedText.attention}
            </h1>
            
            <div className="space-y-4">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {translatedText.emergency}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {translatedText.needHelp}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 leading-tight">
                {translatedText.callServices}
              </p>
            </div>
          </div>

          <div className="w-full pt-4">
            <a 
              href="tel:112" 
              className="flex items-center justify-center gap-4 w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-3xl font-black shadow-xl transition-transform active:scale-95"
            >
              <Phone className="h-10 w-10 fill-current" />
              {translatedText.dial112}
            </a>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-lg font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;