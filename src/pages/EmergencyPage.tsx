import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Share2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { shareCard, downloadCard } from '@/lib/card-utils';
import EmergencyActions from '@/components/EmergencyActions';
import { useTranslation } from 'react-i18next';
import { SavedCard } from '@/lib/types';

const EmergencyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customMessages, setCustomMessages] = useState<string[]>([]);
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fromWidget = false; // This should be set based on your logic, e.g., from location state  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
      if (emergencyCard) {
        setSelectedAllergens(emergencyCard.selectedAllergens.ids || []);
        setCustomMessages([emergencyCard.customMessages.iAmAllergicTo, emergencyCard.customMessages.theyMakeMeSick]);
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

  // ... rest of the file remains the same
};

export default EmergencyPage;