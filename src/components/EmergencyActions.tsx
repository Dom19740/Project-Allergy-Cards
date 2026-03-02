"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, ArrowLeft, Loader2 } from 'lucide-react';

interface EmergencyActionsProps {
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  isSharing?: boolean;
  isDownloading?: boolean;
}

const EmergencyActions: React.FC<EmergencyActionsProps> = ({
  onBack,
  onShare,
  onDownload,
  isSharing = false,
  isDownloading = false
}) => {
  return (
    <div className="w-full py-4 flex justify-center bg-white z-30">
      <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-md border border-gray-200">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:bg-gray-100 rounded-full h-10 w-10"
          title="Back to Card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

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
      </div>
    </div>
  );
};

export default EmergencyActions;