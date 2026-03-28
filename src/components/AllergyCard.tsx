"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { LanguageCode, TranslatedContent, CustomMessages } from '@/lib/types';
import { languages } from '@/lib/languages';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import SaveCardDialog from './SaveCardDialog';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import DisclaimerDialog from './DisclaimerDialog';

interface AllergyCardProps {
  languageCode: LanguageCode;
  selectedAllergens: string[];
  initialTranslations?: TranslatedContent | null;
  fromWidget?: boolean;
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode, selectedAllergens, initialTranslations, fromWidget = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  
  const [translations, setTranslations] = useState<TranslatedContent | null>(initialTranslations || null);
  const [translatedAllergens, setTranslatedAllergens] = useState<Record<string, string>>(() => {
    if (initialTranslations?.allergens) {
      const allergens = Array.isArray(initialTranslations.allergens) 
        ? initialTranslations.allergens 
        : Object.values(initialTranslations.allergens || {});
      return (allergens as string[]).reduce((acc, curr, idx) => ({ ...acc, [idx]: curr }), {} as Record<string, string>);
    }
    return {};
  });

  const [translatedUIText, setTranslatedUIText] = useState(initialTranslations?.ui || {
    allergyAlert: "ALLERGY ALERT!",
    iAmAllergicTo: "I am allergic to:",
    pleaseBeCareful: "Please be careful with my food.",
    thankYou: "Thank you for your help!",
    theyMakeMeSick: "They make me very sick."
  });

  const [emergencyTranslations, setEmergencyTranslations] = useState(initialTranslations?.emergency || {
    attention: "ATTENTION",
    emergency: "EMERGENCY",
    needHelp: "I NEED HELP",
    callServices: "Please call emergency services",
    dial112: "Dial 112 or local emergency number"
  });

  const [customMessages, setCustomMessages] = useState<CustomMessages>({
    iAmAllergicTo: '',
    theyMakeMeSick: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!initialTranslations) {
        const sessionData = await storage.get<{ languageCode: string, content: TranslatedContent }>(STORAGE_KEYS.SESSION_TRANSLATIONS);
        if (sessionData && sessionData.languageCode === languageCode) {
          setTranslations(sessionData.content);
          if (sessionData.content.ui) setTranslatedUIText(sessionData.content.ui);
          if (sessionData.content.emergency) setEmergencyTranslations(sessionData.content.emergency);
          
          const allergens = Array.isArray(sessionData.content.allergens) 
            ? sessionData.content.allergens 
            : Object.values(sessionData.content.allergens || {});
          setTranslatedAllergens((allergens as string[]).reduce((acc, curr, idx) => ({ ...acc, [idx]: curr }), {} as Record<string, string>));
        }
      }
      
      const savedMessages = await storage.get<CustomMessages>(STORAGE_KEYS.CUSTOM_MESSAGES);
      if (savedMessages) {
        setCustomMessages(savedMessages);
      }
    };
    loadData();
  }, [languageCode, initialTranslations]);

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
        const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'My Allergy Card',
            text: 'Please see my allergy information.'
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'allergy-card.png';
          a.click();
          toast.success('Card downloaded for sharing');
        }
      });
    } catch (error) {
      toast.error('Failed to share card');
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
      a.download = `allergy-card-${languageCode}.png`;
      a.click();
      toast.success('Card downloaded successfully');
    } catch (error) {
      toast.error('Failed to download card');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmergency = () => {
    navigate(`/emergency/${languageCode}`);
  };

  if (!translations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading your card...</p>
      </div>
    );
  }

  const languageName = languages.find(l => l.code === languageCode)?.name || languageCode;

  // Safety check for allergens array
  const allergensArray = (Array.isArray(translations.allergens) 
    ? translations.allergens 
    : Object.values(translations.allergens || {})) as string[];

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div 
        ref={cardRef}
        className="relative bg-white rounded-3xl shadow-xl border-2 border-red-600 overflow-hidden aspect-[1/1.4] flex flex-col"
      >
        {/* Header */}
        <div className="bg-red-600 p-6 text-white text-center space-y-1">
          <div className="flex justify-center mb-2">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">
            {translations.title}
          </h1>
          <p className="text-sm font-bold opacity-90">
            {languageName}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-red-600 uppercase tracking-wide">
              {translations.severity}
            </h2>
            <div className="h-1 w-12 bg-red-600 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allergensArray.map((allergen, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full shrink-0" />
                <span className="font-bold text-gray-900 leading-tight">{allergen}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-gray-800 font-medium leading-relaxed italic">
              "{translations.instructions}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-widest">
            {translations.footer}
          </p>
        </div>
      </div>

      <CardActions 
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSave={() => setIsSaveDialogOpen(true)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onEmergency={handleEmergency}
        isSharing={isSharing}
        isDownloading={isDownloading}
        fromWidget={fromWidget}
      />

      <CardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)} 
        languageCode={languageCode}
        fromWidget={fromWidget}
      />

      <SaveCardDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        languageCode={languageCode}
        selectedAllergens={{
          standard: selectedAllergens.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
          custom: {},
          ids: selectedAllergens
        }}
        customMessages={customMessages}
        translatedContent={{
          ...translations,
          ui: translatedUIText,
          allergens: Object.values(translatedAllergens),
          emergency: emergencyTranslations
        }}
      />

      <DisclaimerDialog 
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default AllergyCard;