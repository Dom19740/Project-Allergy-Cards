"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import FixedHeader from '@/components/FixedHeader';
import CardActions from '@/components/CardActions';
import AllergyCardContent from '@/components/AllergyCardContent';

const AllergyCard = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    const storedAllergens = localStorage.getItem('selectedAllergens');
    const storedLang = localStorage.getItem('targetLanguage');
    const storedAlert = localStorage.getItem('customAlertMessages');

    if (!storedAllergens || !storedLang) {
      navigate('/allergen-selection');
      return;
    }

    try {
      const allergens = JSON.parse(storedAllergens);
      const alertMessages = storedAlert ? JSON.parse(storedAlert) : {
        iAmAllergicTo: "I can not eat:",
        theyMakeMeSick: "They make me very sick and I could die"
      };

      setCardData({
        allergens,
        language: storedLang,
        alertMessages
      });
    } catch (e) {
      console.error("Failed to parse card data", e);
      navigate('/allergen-selection');
    }
  }, [navigate]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = 'allergy-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Card downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download card.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.share) {
        const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'My Allergy Card',
          text: 'Please check my allergy information.'
        });
      } else {
        toast.error("Sharing is not supported on this browser.");
      }
    } catch (err) {
      toast.error("Failed to share card.");
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    toast.success("Card saved to your profile!");
  };

  const handleToggleMenu = () => {
    navigate('/allergen-selection');
  };

  const handleEmergency = () => {
    navigate('/emergency');
  };

  if (!cardData) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 pt-[120px] pb-[80px]">
        <div ref={cardRef} className="w-full max-w-md">
          <AllergyCardContent 
            allergens={cardData.allergens}
            language={cardData.language}
            alertMessages={cardData.alertMessages}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <CardActions 
          onShare={handleShare}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onSave={handleSave}
          onToggleMenu={handleToggleMenu}
          onEmergency={handleEmergency}
          isSharing={isSharing}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};

export default AllergyCard;