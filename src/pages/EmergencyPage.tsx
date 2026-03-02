"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';
import { translateText } from '@/lib/translator';
import EmergencyActions from '@/components/EmergencyActions';
import html2canvas from 'html2canvas';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isTranslating, setIsTranslating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [translatedText, setTranslatedText] = useState({
    attention: "ATTENTION",
    emergency: "I am having a severe allergic reaction.",
    needHelp: "I need medical help immediately.",
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
          translateText("I am having a severe allergic reaction.", langCode),
          translateText("I need medical help immediately.", langCode),
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

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create image');

      const file = new File([blob], 'emergency-message.png', { type: 'image/png' });
      
      if (navigator.share) {
        const shareData: ShareData = {
          title: 'Emergency Medical Message',
          text: `${translatedText.attention}: ${translatedText.emergency}`,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        } else {
          shareData.url = window.location.href;
        }

        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Emergency Medical Message',
            text: `${translatedText.attention}\n${translatedText.emergency}\n${translatedText.needHelp}`,
            url: window.location.href,
          });
        } catch (e) {
          console.error('Text share failed:', e);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `emergency-message-${langCode || 'en'}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-xl font-medium text-gray-600">Preparing emergency message...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 overflow-y-auto">
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 sm:space-y-8">
          <div ref={cardRef} className="w-full flex flex-col items-center space-y-4 sm:space-y-8 bg-white p-2 sm:p-4 rounded-3xl">
            <div className="bg-red-600 p-4 sm:p-6 rounded-full shadow-lg shrink-0">
              <AlertTriangle className="h-10 w-10 sm:h-16 sm:w-16 text-white" />
            </div>
            
            <div className="space-y-4 sm:space-y-6 bg-red-50 p-4 sm:p-8 rounded-3xl border-2 border-red-200 w-full">
              <div className="flex justify-center border-b-4 border-red-600 pb-2 sm:pb-4">
                <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-red-600 text-center">
                  {translatedText.attention}
                </h1>
              </div>
              
              <div className="space-y-2 sm:space-y-4">
                <p className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {translatedText.emergency}
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {translatedText.needHelp}
                </p>
                <p className="text-xl sm:text-3xl font-bold text-red-700 leading-tight">
                  {translatedText.callServices}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full pt-2">
            <a 
              href="tel:112" 
              className="flex items-center justify-center gap-3 sm:gap-4 w-full py-4 sm:py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-2xl sm:text-3xl font-black shadow-xl transition-transform active:scale-95"
            >
              <Phone className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
              {translatedText.dial112}
            </a>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 shrink-0">
          <EmergencyActions 
            onBack={() => navigate(-1)}
            onShare={handleShare}
            onDownload={handleDownload}
            isSharing={isSharing}
            isDownloading={isDownloading}
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;