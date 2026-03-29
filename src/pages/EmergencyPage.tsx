"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Share2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { shareCard, downloadCard } from '@/lib/card-utils';
import EmergencyActions from '@/components/EmergencyActions';
import { useTranslation } from 'react-i18next';

const EmergencyPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customMessages, setCustomMessages] = useState<string[]>([]);
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fromWidget = location.state?.fromWidget || false;

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      const emergencyCard = await storage.get(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      if (emergencyCard) {
        setSelectedAllergens(emergencyCard.selectedAllergens);
        setCustomMessages(emergencyCard.customMessages);
        setLanguageCode(emergencyCard.languageCode);
      } else {
        toast({
          title: t('error.title'),
          description: t('error.noEmergencyCard'),
          variant: 'destructive',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load emergency card:', error);
      toast({
        title: t('error.title'),
        description: t('error.loadEmergency'),
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareCard(selectedAllergens, customMessages, languageCode);
      toast({
        title: t('success.title'),
        description: t('success.share'),
      });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.share'),
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCard(selectedAllergens, customMessages, languageCode);
      toast({
        title: t('success.title'),
        description: t('success.download'),
      });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.download'),
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const openApp = () => {
    navigate('/', { replace: true, state: { fromWidget: false } });
  };

  if (selectedAllergens.length === 0 && customMessages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">{t('card.noAllergens')}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold text-red-600">{t('emergency.title')}</h1>
            </div>
          </div>

          {selectedAllergens.map((allergen) => (
            <div key={allergen} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-lg text-red-600">{allergen}</h3>
            </div>
          ))}
          {customMessages.map((message, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-700">{message}</p>
            </div>
          ))}
        </div>
      </div>

      <EmergencyActions
        onBack={() => navigate(-1)}
        onShare={handleShare}
        onDownload={handleDownload}
        onToggleMenu={() => {}}
        onSave={() => {}}
        isSharing={isSharing}
        isDownloading={isDownloading}
        fromWidget={fromWidget}
        onOpenApp={openApp}
      />
    </div>
  );
};

export default EmergencyPage;