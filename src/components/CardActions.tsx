"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Save, Loader2, Menu, AlertTriangle } from 'lucide-react';

interface CardActionsProps {
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onSave: () => void;
  onToggleMenu: () => void;
  onEmergency: () => void;
  isSharing: boolean;
  isDownloading: boolean;
}

const CardActions: React.FC<CardActionsProps> = ({
  onShare,
  onDownload,
  onPrint,
  onSave,
  onToggleMenu,
  onEmergency,
  isSharing,
  isDownloading
}) => {
  return (
    <div className="w-full pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex justify-center bg-white border-t border-gray-100 z-30">
      <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-md border border-gray-200">
        
        <Button
          onClick={onToggleMenu}
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:bg-gray-100 rounded-full h-10 w-10"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
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
          onClick={onDownload}
          disabled={isDownloading}
          variant="ghost"
          size="icon"
          className="text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
          title="Download Card"
        >
          {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        </Button>

        <Button
          onClick={onEmergency}
          variant="ghost"
          size="icon"
          className="text-orange-600 hover:bg-orange-50 rounded-full h-10 w-10"
          title="Emergency"
        >
          <AlertTriangle className="h-5 w-5" />
        </Button>

      </div>
    </div>
  );
};

export default CardActions;