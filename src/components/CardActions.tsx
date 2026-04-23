"use client";

import React from 'react';
import { Share2, Download, Printer, Save, Menu, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReadAloudButton from './ReadAloudButton';
import { CardData, TranslatedContent } from '@/lib/types';

interface CardActionsProps {
  onShare: () => void;
  onDownload: () => void;
  cardData: CardData;
  translatedData: TranslatedContent;
  languageCode: string;
  // Added to fix TS errors in Index.tsx
  onPrint?: () => void;
  onSave?: () => void;
  onToggleMenu?: () => void;
  onEmergency?: () => void;
  onReadAloud?: () => void;
  isSharing?: boolean;
  isDownloading?: boolean;
  isSpeaking?: boolean;
}

const CardActions = ({ 
  onShare, 
  onDownload, 
  cardData, 
  translatedData, 
  languageCode,
  onPrint,
  onSave,
  onToggleMenu,
  onEmergency,
  isSharing,
  isDownloading
}: CardActionsProps) => {
  const textToRead = [
    translatedData.title,
    ...translatedData.alerts,
    ...translatedData.allergens
  ].join(". ");

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pb-8">
      <ReadAloudButton text={textToRead} languageCode={languageCode} />
      
      <Button
        variant="outline"
        size="icon"
        onClick={onDownload}
        disabled={isDownloading}
        className="rounded-full w-12 h-12 bg-white dark:bg-gray-800 shadow-md"
        title="Download Image"
      >
        <Download className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onShare}
        disabled={isSharing}
        className="rounded-full w-12 h-12 bg-white dark:bg-gray-800 shadow-md"
        title="Share Card"
      >
        <Share2 className="h-6 w-6" />
      </Button>

      {onPrint && (
        <Button
          variant="outline"
          size="icon"
          onClick={onPrint}
          className="rounded-full w-12 h-12 bg-white dark:bg-gray-800 shadow-md"
          title="Print Card"
        >
          <Printer className="h-6 w-6" />
        </Button>
      )}

      {onSave && (
        <Button
          variant="outline"
          size="icon"
          onClick={onSave}
          className="rounded-full w-12 h-12 bg-white dark:bg-gray-800 shadow-md"
          title="Save Card"
        >
          <Save className="h-6 w-6" />
        </Button>
      )}

      {onEmergency && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onEmergency}
          className="rounded-full w-12 h-12 shadow-md"
          title="Emergency"
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default CardActions;