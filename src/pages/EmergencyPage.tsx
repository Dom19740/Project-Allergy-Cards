"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { SavedCard, TranslatedContent } from '@/lib/types';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import EmergencyActions from '@/components/EmergencyActions';
import CardMenu from '@/components/CardMenu';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import SaveCardDialog from '@/components/SaveCardDialog';

const EmergencyPage = () => {
  const { langCode } = useParams<{ langCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromWidget = location.state?.fromWidget || false;
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<TranslatedContent | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [emergencyCard, setEmergencyCard] = useState<SavedCard | null>(null);

  useEffect(() => {
    const loadEmergencyData = async () => {
      try {
        const card = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
        if (card) {
          setEmergencyCard(card);
          setTranslations(card.translatedContent);
        } else {
          const sessionData = await storage.get<{ languageCode: string, content: TranslatedContent }>(STORAGE_KEYS.SESSION_TRANSLATIONS);
          if (sessionData && sessionData.languageCode === langCode) {
            setTranslations(sessionData.content);
          }
        }
      } catch (error) {
        console.error('Error loading emergency data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmergencyData();
  }, [langCode]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'emergency-card.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'EMERGENCY Allergy Card',
            text: 'URGENT: Please see my emergency allergy information.'
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'emergency-card.png';
          a.click();
          toast.success('Emergency card downloaded');
        }
      });
    } catch (error) {
      toast.error('Failed to share emergency card');
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
        useCORS: true
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency-card-${langCode}.png`;
      a.click();
      toast.success('Emergency card downloaded');
    } catch (error) {
      toast.error('Failed to download emergency card');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = () => {
    setIsSaveDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-red-900 font-medium">Loading Emergency Card...</p>
      </div>
    );
  }

  if (!translations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-900 mb-2">No Emergency Card Found</h1>
        <p className="text-red-700 mb-6">Please set up your allergy card first to generate an emergency version.</p>
        <button 
          onClick={() => navigate('/setup')}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  // Safety check for allergens array
  const allergensArray = (Array.isArray(translations.allergens) 
    ? translations.allergens 
    : Object.values(translations.allergens || {})) as string[];

  return (
    <div className="flex flex-col items-center min-h-screen bg-red-600 p-4 pb-24">
      <div className="w-full max-w-md mb-6 text-center text-white pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-xl">
          <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Emergency Card</h1>
        <p className="text-red-100 font-bold opacity-90">Show this to medical staff or bystanders</p>
      </div>

      <div 
        ref={cardRef}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-4 border-red-900 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
      >
        <div className="bg-red-900 p-6 text-white text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
            {translations.title}
          </h2>
          <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full" />
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-red-600 uppercase tracking-widest flex items-center">
              <span className="mr-3">⚠️</span> {translations.severity}
            </h3>
            <div className="grid gap-3">
              {allergensArray.map((allergen, index) => (
                <div key={index} className="flex items-center p-4 bg-red-50 rounded-2xl border-2 border-red-100">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-4 shadow-sm" />
                  <span className="text-2xl font-black text-gray-900">{allergen}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-xl font-bold text-gray-800 leading-relaxed text-center italic">
              "{translations.instructions}"
            </p>
          </div>
        </div>

        <div className="mt-auto p-6 bg-red-900 text-white text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
            {translations.footer}
          </p>
        </div>
      </div>

      <EmergencyActions 
        onBack={() => {
          if (fromWidget) {
            navigate(`/alert/${langCode}`);
          } else {
            navigate(-1);
          }
        }} 
        onShare={handleShare} 
        onDownload={handleDownload} 
        onToggleMenu={() => setIsMenuOpen(true)}
        onSave={handleSave} 
        isSharing={isSharing} 
        isDownloading={isDownloading} 
        fromWidget={fromWidget}
      />

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        languageCode={langCode}
        isEmergency={true}
        fromWidget={fromWidget}
      />

      <DisclaimerDialog 
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {emergencyCard && (
        <SaveCardDialog 
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          languageCode={emergencyCard.languageCode}
          selectedAllergens={emergencyCard.selectedAllergens}
          customMessages={emergencyCard.customMessages}
          translatedContent={emergencyCard.translatedContent}
          isEmergency={true}
        />
      )}
    </div>
  );
};

export default EmergencyPage;