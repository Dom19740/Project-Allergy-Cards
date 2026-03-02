"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { translateText } from '@/lib/translator';
import FixedHeader from '@/components/FixedHeader';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(true);
  const [translatedText, setTranslatedText] = useState({
    attention: "ATTENTION",
    emergency: "I am having a medical emergency.",
    needHelp: "I need help immediately.",
    callServices: "Please call emergency services."
  });

  useEffect(() => {
    const translateEmergencyContent = async () => {
      if (!langCode || langCode === 'en') {
        setIsTranslating(false);
        return;
      }

      try {
        const [attention, emergency, needHelp, callServices] = await Promise.all([
          translateText("ATTENTION", langCode),
          translateText("I am having a medical emergency.", langCode),
          translateText("I need help immediately.", langCode),
          translateText("Please call emergency services.", langCode)
        ]);

        setTranslatedText({
          attention,
          emergency,
          needHelp,
          callServices
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
    <div className="flex flex-col min-h-screen bg-red-600 text-white">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-6 pt-[140px] pb-10">
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12">
          <div className="bg-white p-8 rounded-full animate-pulse shadow-2xl">
            <AlertTriangle className="h-24 w-24 text-red-600" />
          </div>
          
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase border-b-8 border-white pb-4">
              {translatedText.attention}
            </h1>
            
            <div className="space-y-6">
              <p className="text-3xl sm:text-4xl font-bold leading-tight">
                {translatedText.emergency}
              </p>
              <p className="text-3xl sm:text-4xl font-bold leading-tight">
                {translatedText.needHelp}
              </p>
              <p className="text-3xl sm:text-4xl font-bold leading-tight underline decoration-4 underline-offset-8">
                {translatedText.callServices}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-xl font-bold backdrop-blur-sm"
          >
            <ArrowLeft className="h-6 w-6" />
            Back to Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;