"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Printer, Save, Loader2, Menu } from 'lucide-react';

interface CardActionsProps {
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onSave: () => void;
  onToggleMenu: () => void;
  isSharing: boolean;
  isDownloading: boolean;
}

const CardActions: React.FC<CardActionsProps> = ({
  onShare,
  onDownload,
  onPrint,
  onSave,
  onToggleMenu,
  isSharing,
  isDownloading
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-30 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200">
      <Button
        onClick={onShare}
        disabled={isSharing}
        variant="ghost"
        size="icon"
        className="text-green-600 hover:bg-green-50 rounded-full h-10 w-10"
        title="Share Card"
      >
        {isSharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
      </Button>

      <Button
        onClick={onSave}
        variant="ghost"
        size="icon"
        className="text-red-600 hover:bg-red-50 rounded-full h-10 w-10"
        title="Save Card"
      >
        <Save className="h-5 w-5" />
      </Button>

      <Button
        onClick={onPrint}
        variant="ghost"
        size="icon"
        className="text-gray-700 hover:bg-gray-100 rounded-full h-10 w-10"
        title="Print Card"
      >
        <Printer className="h-5 w-5" />
      </Button>

      <Button
        onClick={onDownload}
        disabled={isDownloading}
        variant="ghost"
        size="icon"
        className="text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
        title="Download Image"
      >
        {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <Button
        onClick={onToggleMenu}
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:bg-gray-100 rounded-full h-10 w-10"
        title="Navigation Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default CardActions;