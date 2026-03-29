"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Download, Save, Loader2, Menu, AlertTriangle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { SavedCard } from '@/lib/types';
import { shareCard, downloadCard, printCard } from '@/lib/card-utils';
import CardActions from './CardActions';
import CardMenu from './CardMenu';
import { useTranslation } from 'react-i18next';

interface AllergyCardProps {
  languageCode: string;
}

const AllergyCard: React.FC<AllergyCardProps> = ({ languageCode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customMessages, setCustomMessages] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const fromWidget = location.state?.fromWidget || false;

  useEffect(() => {
    loadCardData();
  }, [languageCode]);

  const loadCardData = async () => {
    try {
      const savedAllergens = await storage.get<string[]>(STORAGE_KEYS.SELECTED_ALLERGENS) || [];
      const savedMessages = await storage.get<string[]>(STORAGE_KEYS.CUSTOM_MESSAGES) || [];
      setSelectedAllergens(savedAllergens);
      setCustomMessages(savedMessages);
    } catch (error) {
      console.error('Failed to load card data:', error);
      toast({
        title: t('error.title'),
        description: t('error.loadCard'),
        variant: 'destructive',
      });
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

  const handlePrint = () => {
    printCard(selectedAllergens, customMessages, languageCode);
  };

  const handleSave = async () => {
    try {
      const cardToSave: SavedCard = {
        id: Date.now().toString(),
        selectedAllergens,
        customMessages,
        languageCode,
        createdAt: new Date().toISOString(),
      };
      const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
      savedCards.push(cardToSave);
      await storage.set(STORAGE_KEYS.SAVED_CARDS, savedCards);
      toast({
        title: t('success.title'),
        description: t('success.save'),
      });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.save'),
        variant: 'destructive',
      });
    }
  };

  const handleEmergency = () => {
    navigate(`/emergency/${languageCode}`, { state: { fromWidget } });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

      <CardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onEdit={() => navigate('/')}
        onDelete={async () => {
          try {
            const savedCards = await storage.get<SavedCard[]>(STORAGE_KEYS.SAVED_CARDS) || [];
            const updatedCards = savedCards.filter(card => card.languageCode !== languageCode);
            await storage.set(STORAGE_KEYS.SAVED_CARDS, updatedCards);
            toast({
              title: t('success.title'),
              description: t('success.delete'),
            });
            navigate('/');
          } catch (error) {
            toast({
              title: t('error.title'),
              description: t('error.delete'),
              variant: 'destructive',
            });
          }
        }}
        fromWidget={fromWidget}
      />

      <CardActions
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onSave={handleSave}
        onToggleMenu={toggleMenu}
        onEmergency={handleEmergency}
        isSharing={isSharing}
        isDownloading={isDownloading}
        fromWidget={fromWidget}
        onOpenApp={openApp}
      />
    </div>
  );
};

export default AllergyCard;